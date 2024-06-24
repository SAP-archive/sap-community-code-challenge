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
    "sap/m/ButtonType",
    "sap/m/List",
    "sap/m/Input",
    "sap/m/InputListItem",
    "sap/m/ColorPalette",
    "sap/m/Switch",
],
    function (BaseController, MessageToast, oCore, JSONModel, Device, SuiteLibrary, Dialog, Button, ButtonType, List, Input, InputListItem, ColorPalette, Switch) {

        return BaseController.extend("profilePic.controller.App", {
            onInit: function () {
                var oImageEditor = this.getView().byId("image"),
                    oModel = new JSONModel(sap.ui.require.toUrl("profilePic/pixelPersonConfig.json"))

                this.getView().setModel(oModel)
                if (!Device.browser.msie) {
                    // svg files are not supported in Internet Explorer
                    oImageEditor.setCustomShapeSrc(sap.ui.require.toUrl("sap/suite/ui/commons/statusindicator") + "/shapes/bulb.svg")
                }
            },
            
            openPixelPersonDialog: function () {
                if (!this.oDefaultDialog) {
                    this.oDefaultDialog = new Dialog({
                        title: "Generate Pixel Person",
                        contentWidth: "550px",
                        contentHeight: "300px",
                        draggable: true,
                        content: new List({
                            items: {
                                path: "/pixelPersonConfigArray",
                                template: new InputListItem ({
                                    label: "{label}",
                                    content: [
                                        new Switch ({
                                            visible: "{switchableProp}",
                                            state: "{isSelected}"
                                        }),
                                        new ColorPalette ({
                                            colorSelect: function (oEvent) {
                                                this.handleColorSelect(oEvent)
                                            }.bind(this),
                                            colors: "{colors}"
                                        }),
                                        new Input ({
                                            value: "{selectedColor}"
                                        })
                                    ]
                                }).addStyleClass("doubleHeight")
                            }
                        }),
                        //visible="{= ${marketed} === true}"
                        beginButton: new Button({
                            type: ButtonType.Emphasized,
                            text: "Generate",
                            press: function () {
                                this.getPixelPerson()
                                this.oDefaultDialog.close();
                            }.bind(this)
                        }),
                        endButton: new Button({
                            text: "Close",
                            press: function () {
                                this.oDefaultDialog.close();
                            }.bind(this)
                        })
                    });
    
                    this.getView().addDependent(this.oDefaultDialog);
                }
    
                this.oDefaultDialog.open();
            },

            handleColorSelect: function (oEvent) {
                let siblingInput = oEvent.getSource().getParent().getContent()[2]
                siblingInput.setValue(oEvent.getParameter("value"))
            },

            getPixelPersonRequestBody: function () {
                let dataFromModel = this.getView().getModel().getData().pixelPersonConfigArray
                let requestBody = {}
                requestBody.colors = {}
                requestBody.shapes = {}
                for (let i = 0; i < dataFromModel.length; i++) {
                    requestBody.colors[dataFromModel[i].id] = dataFromModel[i].selectedColor
                    if (dataFromModel[i].switchableProp) {
                        requestBody.shapes[dataFromModel[i].id] = dataFromModel[i].isSelected
                    }
                }
                return requestBody
            },

            getPixelPerson: function () {
                let controller = this
                let reqSettings = {
                    "url": "/get-pixel-person",
                    "method": "POST",
                    "timeout": 0,
                    "headers": {
                      "Content-Type": "application/json"
                    },
                    "data": JSON.stringify(this.getPixelPersonRequestBody()),
                  };
                  jQuery.ajax(reqSettings).done(function (response) {
                    
                    //give native html canvas global ui5 id
                    let pixelPersonCanvasID = controller.createId("pixelPersonCanvas1");
                    let pixelPersonCanvas = document.getElementById(pixelPersonCanvasID)

                    //generate pixel person from response
                    let pixelSize = 10
                    let artPadding = 100
                    pixelPersonCanvas.width = (response[0].length * pixelSize) + (2 * artPadding)
                    pixelPersonCanvas.height = (response.length * pixelSize) + (2 * artPadding)
                    let canvasCtx = pixelPersonCanvas.getContext("2d")
                    canvasCtx.fillStyle = "#999"
                    canvasCtx.fillRect(0, 0, pixelPersonCanvas.width, pixelPersonCanvas.height);
                    for (let i = 0; i < response.length; i++) {
                        for (let p = 0; p < response[i].length; p++) {
                            let x = (p * pixelSize) + artPadding
                            let y = (i * pixelSize) + artPadding
                            canvasCtx.fillStyle = response[i][p];
                            canvasCtx.fillRect(x, y, pixelSize, pixelSize);
                        }
                    }

                    //convert canvas to dataURI and set as source for image editor and file uploader
                    let dataURI = pixelPersonCanvas.toDataURL()
                    let oFileUploader = controller.getView().byId("fileToUpload")
                    oFileUploader.setValue(dataURI)
                    let artAreaImg = controller.getView().byId("image")
                    artAreaImg.setSrc(dataURI)
                  });
            },

            //enhance
            uploadPressed: async function (oEvent) {
                let view = this.getView()
                let controller = view.getController()
                let oFileUploader = view.byId("fileToUpload")
                console.log(oFileUploader.getValue())
                if (!oFileUploader.getValue()) {
                    MessageToast.show("Choose a file first")
                    return
                }
                let param = view.byId("uploadParam")
                //param.setValue(oInput.getActivePage())
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