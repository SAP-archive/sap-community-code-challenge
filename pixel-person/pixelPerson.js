const artCanvas = [17, 58]
const backgroundCol = "#999"
const switchConfig = [
    ["glasses", "eyes"],
    ["beard", "mouth"],
    ["watch"]
]
import { layerArrays } from "./pixelLayers.js"

export const createPixelPerson = (configObj) => {
    let colorConfig = configObj.colors
    let shapesConfig = configObj.shapes

    for (let i = 0; i < switchConfig.length; i++) {
        if (switchConfig[i].length > 1) {
            if (shapesConfig[switchConfig[i][0]]) {
                shapesConfig[switchConfig[i][1]] = false
            } else {
                shapesConfig[switchConfig[i][1]] = true
            }
        }
    }
    
    return addColorsAndLayers(createPicArray(artCanvas, backgroundCol), colorConfig, shapesConfig)
}

const createPicArray = (artCanvas, backgroundCol) => {
    let picArray = []
    for (let i = 0; i < artCanvas[1]; i++) {
        picArray.push([])
        for (let p = 0; p < artCanvas[0]; p++) {
            picArray[i].push([backgroundCol])
        }
    }
    return picArray
}

const addColorsAndLayers = (picArray, colorConfig, shapesConfig) => {
    if (invalidPicArray(picArray)) return
    for (const [layerKey, layerValue] of Object.entries(layerArrays)) {
        let switchableProp = false
        for (let i = 0; i < switchConfig.length; i++) {
            if (switchConfig[i].some(v => layerKey.includes(v))) {
                switchableProp = true
            }
        }
        if (!switchableProp) {
            writeIntoPicArray(picArray, layerValue, colorConfig[layerKey])
        } else {
            //find key of shapesConfig that is substring of key in layerArrays
            for (const [configKey] of Object.entries(shapesConfig)) {
                if (layerKey.indexOf(configKey) != -1) {    
                    //writeIntoPicArray according to shapesConfig
                    if (shapesConfig[configKey]) {
                        writeIntoPicArray(picArray, layerValue, colorConfig[layerKey])
                    }
                }
            }
        }        
        switchableProp = true
    }
    return picArray
}

const writeIntoPicArray = (picArray, templateArray, templateCol) => {
    for (let i = 0; i < templateArray.length; i++) {
        for (let p = 0; p < artCanvas[0]; p++) {
            let currentIndex = templateArray[i][p]
            if (typeof currentIndex === "number") {
                picArray[i][currentIndex - 1] = templateCol
            } else if (typeof currentIndex === "string") {
                let rangeArray = currentIndex.split("-")
                let startLoop = parseInt(rangeArray[0])
                let endLoop = parseInt(rangeArray[1])
                for (let k = startLoop - 1; k < endLoop; k++) {
                    picArray[i][k] = templateCol
                }
            }
        }
    }
    return picArray
}

const invalidPicArray = (picArray) => {
    if (!picArray || typeof picArray !== "object" || picArray.length !== artCanvas[1]) {
        return true
    } else {
        return false
    }
}

