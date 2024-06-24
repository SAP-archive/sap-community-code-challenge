/* eslint-disable no-undef */
/*eslint-env es6 */
"use strict";
sap.ui.define(
  [
    "profilePic/controller/BaseController",
    "sap/m/MessageToast",
    "sap/ui/core/Core",
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device",
    "sap/suite/ui/commons/library",
    "sap/m/Dialog",
  ],
  function (
    BaseController,
    MessageToast,
    oCore,
    JSONModel,
    Device,
    SuiteLibrary,
    Dialog
  ) {
    return BaseController.extend("profilePic.controller.App", {
      onInit: function () {
        var oImageEditor = this.getView().byId("image"),
          oModel = new JSONModel({
            blocked: true,
            username: "",
            ghRateLimit: {},
          });

        this.getView().setModel(oModel);
        if (!Device.browser.msie) {
          // svg files are not supported in Internet Explorer
          oImageEditor.setCustomShapeSrc(
            sap.ui.require.toUrl("sap/suite/ui/commons/statusindicator") +
              "/shapes/bulb.svg"
          );
        }
      },

      uploadPressed: async function (oEvent) {
        let view = this.getView();
        let controller = view.getController();
        let oFileUploader = view.byId("fileToUpload");
        if (!oFileUploader.getValue()) {
          MessageToast.show("Choose a file first");
          return;
        }
        let param = view.byId("uploadParam");
        //param.setValue(oInput.getActivePage())
        oFileUploader.getParameters();
        var oImageEditor = this.getView().byId("image");
        oImageEditor.applyVisibleCrop();
        oFileUploader.getProcessedBlobsFromArray = async function (oBlobs) {
          return new Promise(async (resolve, reject) => {
            let newBlob = await oImageEditor.getImageAsBlob();
            resolve([newBlob]);
          });
        };
        controller.startBusy();
        oFileUploader.upload(true);
      },

      uploadStart: async function (oEvent) {
        let view = this.getView();
        let controller = view.getController();
        controller.startBusy();
      },

      uploadComplete: async function (oEvent) {
        let view = this.getView();
        let controller = view.getController();
        let dataURL =
          "data:image/png;base64," + oEvent.getParameters().responseRaw;
        let oImageEditor = view.byId("image");
        await oImageEditor.setSrc(dataURL);
        controller.endBusy(controller);
      },

      onSaveAsPress: async function () {
        let view = this.getView();
        let controller = view.getController();
        let oImageEditor = view.byId("image");
        oImageEditor.openSaveDialog();
        controller.openUrl("https://people.sap.com/", true);
      },
      onImageLoaded: async function (oEvent) {
        let view = this.getView();
        let oImageEditor = view.byId("image");
        oImageEditor.zoomToFit();
        oImageEditor.setCropAreaByRatio(1, 1);
        oImageEditor.setMode(SuiteLibrary.ImageEditorMode.CropRectangle);
      },
      onFileChange: async function (oEvent) {
        var oFile = oEvent.getParameter("files")[0],
          oImageEditor = this.getView().byId("image");
        if (!oFile) {
          return;
        }
        this.getView().getModel().setProperty("/blocked", true);
        await oImageEditor.setSrc(oFile);
      },
      onGHImportPressed: async function (oEvent) {
        var oModel = this.getView().getModel();
        // Get Rate Limit
        $.get(
          "/gh_rate_limit",
          function (resp) {
            oModel.setProperty("/ghRateLimit", resp);
            this.askForGHUsername();
          }.bind(this)
        );
      },
      askForGHUsername: function () {
        var oModel = this.getView().getModel();
        if (!this.oUsernameDialog) {
          this.oUsernameDialog = new Dialog({
            title: "Enter Github Username",
            content: new sap.m.VBox({
              justifyContent: "Center",
              items: [
                new sap.m.Input({
                  value: "{/username}",
                }).addStyleClass("sapUiTinyMarginBottom"),
                new sap.m.MessageStrip({
                  type: "Information",
                  showIcon: true,
                  text: "Github api rate limit {/ghRateLimit/rate/remaining} / {/ghRateLimit/rate/limit}",
                }),
              ],
            }).addStyleClass("sapUiTinyMargin"),
            beginButton: new sap.m.Button({
              type: sap.m.ButtonType.Emphasized,
              text: "OK",
              press: function () {
                // Check Username
                let username = oModel.getProperty("/username");
                if (username && username.length > 0) {
                  this.getGHProfilePicture(username);
                } else {
                  MessageToast.show("Please provide a username");
                }
                this.oUsernameDialog.close();
              }.bind(this),
            }),
            endButton: new sap.m.Button({
              text: "Close",
              press: function () {
                this.oUsernameDialog.close();
              }.bind(this),
            }),
          });
          // to get access to the controller's model
          this.getView().addDependent(this.oUsernameDialog);
        }

        this.oUsernameDialog.open();
      },

      getGHProfilePicture: function (username) {
        let view = this.getView();
        let controller = view.getController();
        let oImageEditor = view.byId("image");
        controller.startBusy();
        // Get URL
        let dataURL;
        // Get processed image and set to image editor src
        $.post(`/gh_profile_pic/${username}`, function (resp) {
          dataURL = "data:image/png;base64," + resp;
          oImageEditor.setSrc(dataURL);
          controller.endBusy(controller);
        }).fail(function () {
          controller.endBusy(controller);
          MessageToast.show("error");
        });
      },
    });
  }
);
