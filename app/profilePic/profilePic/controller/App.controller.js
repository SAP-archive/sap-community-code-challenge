/* eslint-disable no-undef */
/*eslint-env es6 */
"use strict";
sap.ui.define([
    "profilePic/controller/BaseController",
    "sap/m/MessageToast",
    "sap/ui/core/Core",
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device",
    "sap/suite/ui/commons/library",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Input",
],
    function (BaseController, MessageToast, oCore, JSONModel, Device, SuiteLibrary, Dialog, Button, Input) {

        return BaseController.extend("profilePic.controller.App", {
            onInit: function () {
                var oImageEditor = this.getView().byId("image"),
                    oModel = new JSONModel({
                        blocked: true
                    })

                this.getView().setModel(oModel)
                if (!Device.browser.msie) {
                    // svg files are not supported in Internet Explorer
                    oImageEditor.setCustomShapeSrc(sap.ui.require.toUrl("sap/suite/ui/commons/statusindicator") + "/shapes/bulb.svg")
                }
            },

            enhancePressed: async function (oEvent) {
                if (!this.oEnhanceDialog) {
                    var oResourceBundle = this.getView()
                                              .getModel("i18n")
                                              .getResourceBundle()
                    this.oEnhanceDialog = new Dialog({
                        title: oResourceBundle.getText("enterSapCommunityName"),
                        draggable: true,
                        content: new Input({
                            placeholder: oResourceBundle.getText("yourSapCommunityNameEG") + "dj.adams.sap",
                            value: "{/sapCommunityName}"
                        }),
                        buttons: [ 
                            new Button({
                                text: oResourceBundle.getText("enhance"),
                                press: function () {
                                    this.upload()
                                    this.oEnhanceDialog.close()
                                }.bind(this)
                            }),
                            new Button({
                                text: oResourceBundle.getText("close"),
                                press: function () {
                                    this.oEnhanceDialog.close()
                                }.bind(this)
                            })
                        ]
                    })
                    this.getView().addDependent(this.oEnhanceDialog)
                }

                this.oEnhanceDialog.open()
            },

            upload: async function (oEvent) {
                let view = this.getView()
                let controller = view.getController()
                let oFileUploader = view.byId("fileToUpload")
                if (!oFileUploader.getValue()) {
                    MessageToast.show("Choose a file first")
                    return
                }
                let param = view.byId("uploadParam")
                //param.setValue(oInput.getActivePage())
                param.setValue(this.getView().getModel().getData().sapCommunityName)
                oFileUploader.getParameters()
                var oImageEditor = this.getView().byId("image")
                oImageEditor.applyVisibleCrop()
                console.log(oImageEditor.getMode())
                oFileUploader.getProcessedBlobsFromArray = async function (oBlobs) {
                    return new Promise(async (resolve, reject) => {
                        let newBlob = await oImageEditor.getImageAsBlob()
                        resolve([newBlob])
                    })
                }
                controller.startBusy()
                oFileUploader.upload(true)
            },

            uploadStart: async function (oEvent) {
                let view = this.getView()
                let controller = view.getController()
                controller.startBusy()
            },

            uploadComplete: async function (oEvent) {
                let view = this.getView()
                let controller = view.getController()
                let dataURL = "data:image/png;base64," + oEvent.getParameters().responseRaw
                let oImageEditor = view.byId("image")
                await oImageEditor.setSrc(dataURL)
                controller.endBusy(controller)
            },

            onSaveAsPress: async function () {
                let view = this.getView()
                let controller = view.getController()
                let oImageEditor = view.byId("image")
                oImageEditor.openSaveDialog()
                controller.openUrl('https://people.sap.com/', true)

            },
            onImageLoaded: async function (oEvent) {
                let view = this.getView()
                let oImageEditor = view.byId("image")
                oImageEditor.zoomToFit()
                oImageEditor.setCropAreaByRatio(1, 1)
                oImageEditor.setMode(SuiteLibrary.ImageEditorMode.CropEllipse)
                console.log(oImageEditor.getMode())



            },
            onFileChange: async function (oEvent) {
                var oFile = oEvent.getParameter("files")[0],
                    oImageEditor = this.getView().byId("image")
                if (!oFile) {
                    return
                }
                this.getView().getModel().setProperty("/blocked", true)
                await oImageEditor.setSrc(oFile)

            }
        })
    }
)