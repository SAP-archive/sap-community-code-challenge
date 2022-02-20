const { join } = require("path")
const {stat} = require("node:fs/promises")

describe("bla", () => {
  before(async () => {
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
    const $tile = await tile.getWebElement()

    await $tile.click()
  })

  it("should upload an image", async () => {
    const fileName = "wdi5-logo.png"
    const filePath = join(__dirname, fileName)
    const remoteFilePath = await browser.uploadFile(filePath)

    const uploader = await browser.asControl({
      forceSelect: true,
      selector: {
        id: "fileToUpload",
        viewName: "profilePic.view.App",
      },
    })
    const $uploader = await uploader.getWebElement()
    const $fileInput = await $uploader.$("input[type=file]")
    await $fileInput.setValue(remoteFilePath)

    const uploadedImage = await uploader.getValue()

    expect(uploadedImage).toEqual(fileName)
  })

  it("should enhance an uploaded image", async () => {
    await browser
      .asControl({
        selector: {
          id: "button",
          viewName: "profilePic.view.App",
        },
      })
      .firePress()

    await browser
      .asControl({
        selector: {
          id: /.*button1$/,
        },
      })
      .firePress()

    browser.screenshot("uploaded-image")
  })

  it("should download an enhanced image", async () => {
    await browser
      .asControl({
        selector: {
          id: "downloadButton",
          viewName: "profilePic.view.App",
        },
      })
      .firePress()

    const downloadedFile = join(__dirname, "__assets__", "image.png")
    expect(await (await stat(downloadedFile)).size).toBeGreaterThan(1)
  })
})
