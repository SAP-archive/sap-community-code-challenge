const { join } = require("path")
const { stat, readFile } = require("node:fs/promises")

describe("profile pic modification flow", () => {
  // navigate the FLP tile
  before(async () => {
    // wdi5 api + UI5 sap.ui.core.Control api
    const tile = await browser
      .asControl({
        selector: {
          properties: {
            text: "SAP Community Profile Picture Editor",
          },
          controlType: "sap.m.Text",
        },
      })
      .getParent()
      .getParent()
    // get wdio element reference
    const $tile = await tile.getWebElement()
    // use wdio api
    await $tile.click()
  })

  it("should upload an image", async () => {
    const fileName = "wdi5-logo.png"
    const filePath = join(__dirname, fileName)
    const remoteFilePath = await browser.uploadFile(filePath)

    // get the UI5 fileuploader control
    const uploader = await browser.asControl({
      forceSelect: true,
      selector: {
        id: "fileToUpload",
        viewName: "profilePic.view.App",
      },
    })
    // get the input type=file html element
    const $uploader = await uploader.getWebElement()
    const $fileInput = await $uploader.$("input[type=file]")
    await $fileInput.setValue(remoteFilePath) // wdio

    // UI5 FileUploader.getValue()
    const uploadedImage = await uploader.getValue()

    expect(uploadedImage).toEqual(fileName)
  })

  it("should enhance an uploaded image", async () => {
    // wdi5
    await browser
      .asControl({
        selector: {
          id: "button",
          viewName: "profilePic.view.App",
        },
      })
      .firePress() // this will go away with wdi5 0.9.0 and replace by .press()

    await browser
      .asControl({
        selector: {
          id: /.*button1$/,
        },
      })
      .firePress() // this will go away with wdi5 0.9.0 and replace by .press()

    // wdi5
    browser.screenshot("uploaded-image")
  })

  it("should download an enhanced image", async () => {
    // wdi5
    await browser
      .asControl({
        selector: {
          id: "downloadButton",
          viewName: "profilePic.view.App",
        },
      })
      .firePress() // this will go away with wdi5 0.9.0 and replace by .press()

    // vanilla Node.js
    const downloadedFile = join(__dirname, "__assets__", "image.png")
    expect(await (await stat(downloadedFile)).size).toBeGreaterThan(1)
  })

  it("should validate the original and downloaded pictures are different", async () => {
    // vanilla Node.js
    const downloadedFile = join(__dirname, "__assets__", "image.png")
    const originalFile = join(__dirname, "wdi5-logo.png")

    const downloadedFileAsBase64 = new Buffer.from(await readFile(downloadedFile)).toString("base64")
    const originalFileAsBase64 = new Buffer.from(await readFile(originalFile)).toString("base64")

    expect(downloadedFileAsBase64).not.toBe(originalFileAsBase64)
  })
})
