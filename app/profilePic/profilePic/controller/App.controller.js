/* eslint-disable no-undef */
/*eslint-env es6 */
"use strict";
sap.ui.define([
        "profilePic/controller/BaseController",
        "sap/m/MessageToast",
        "sap/m/MessageBox",
        "sap/ui/core/Core",
        "sap/ui/model/json/JSONModel",
        "sap/ui/Device",
        "sap/suite/ui/commons/library"
    ],
    function (BaseController, MessageToast, MessageBox, oCore, JSONModel, Device, SuiteLibrary) {

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
                var langModel = new JSONModel(
                    sap.ui.require.toUrl("profilePic/languages.json"))
                this.getView().setModel(langModel, "languages")
                //sap.ui.getCore().getConfiguration().setLanguage("he")
                //sap.ui.getCore().getConfiguration().setRTL(true)


        },

        uploadPressed: async function (oEvent) {
            let view = this.getView()
                let controller = view.getController()
                let oFileUploader = view.byId("fileToUpload")
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
                return new Promise(async(resolve, reject) => {
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
                if (!oImageEditor.getLoaded()) {
                    MessageToast.show("Load a file first")
                } else {
                    oImageEditor.openSaveDialog()
                    controller.openUrl('https://people.sap.com/', true)
                }

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

        },

        redirectFiori: function (url, newLang) {
            if (url.includes("sap-language")) {
                const queryString = window.location.search;
                const urlParams = new URLSearchParams(queryString);
                const lang = urlParams.get('sap-language')
                    return url.replace("sap-language=" + lang, "sap-language=" + newLang)
            } else {
                return url.replace("profilePic/", "profilepic/?sap-language=" + newLang)
            }
        },

        onLanguageChange: async function (oEvent) {
            var selText = oEvent.getParameter("selectedItem").getText()
                var selKey = oEvent.getParameter("selectedItem").getKey()
                if (selKey != sap.ui.getCore().getConfiguration().getLanguage()) {
                    window.location.href = this.redirectFiori(window.location.href, selKey)
                }
        }

    })
})