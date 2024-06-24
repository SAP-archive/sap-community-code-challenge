import sharp from 'sharp'
import multer from 'multer'
import lodash from 'lodash'
import * as svg from '../utils/svgRender.js'
import { promises as fsPromises } from 'fs'
import * as path from 'path'

import https from 'https'
import fs from 'fs'

/**       
 * Route for handing upload, manipulation, and download of the profile picture
 * @param {Object} app - Express application instance
 */
export default function (app) {

    /**
     * Load Local Image as Base64
     * @param {string} image 
     * @returns {Promise<string>}
     */
    async function loadImageB64(image) {
        return await fsPromises.readFile(path.resolve(app.baseDir, image), { encoding: 'base64' })
    }

    /**
     * Download an image URL to the file system
     * @param {string} url 
     * @returns {Promise<T>}
     */
    async function download(url) {
        const path = getPathFromImgUrl(url)
        if (fs.existsSync(path)) return
        return new Promise((resolve, reject) => {
            const writeStream = fs.createWriteStream(path)
            https.get(url, (res) => {
                res.pipe(writeStream)
                writeStream.on('finish', () => resolve())
            }).on('error', (error) => reject(error))
        })
    }

    /**
     * Get the file system path for an image URL
     * @param {string} url 
     * @returns {string}
     */
    function getPathFromImgUrl (url) {
        return './images/' + path.basename(new URL(url).pathname)
    }

    /**
     * Get URLs of badges for a SAP community name
     * @param {string} sapCommunityName
     * @returns {Promise<Array<string>>}
     */
    async function getBadgeUrls (sapCommunityName) {
        const url = 'https://people-api.services.sap.com/rs/showcaseBadge/' + sapCommunityName;        
        return new Promise((resolve, reject) => {    
            https.get(url, (res) => {
                let body = ''
                res.on('data', (chunk) => body += chunk.toString())
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        let badgeUrls = []
                        JSON.parse(body).forEach((ele) => {
                            badgeUrls.push(ele.imageUrl)
                        })
                        resolve(badgeUrls)
                    }
                })
                res.on('error', (error) => reject(error))
            })
        })
    }

    /**
     * Read an svg image from file system and return it as a base64 png string
     * @param {string} path 
     * @returns {Promise<string>}
     */
    async function loadSvgAsPngB64 (path) {
        const svgBuffer = await fsPromises.readFile(path)
        const pngBuffer = await sharp(svgBuffer).png().toBuffer()
        return await pngBuffer.toString('base64')
    }    

    const limits = {
        files: 1, // allow only 1 file per request
        fileSize: 1024 * 1024 * 20, // 20 MB (max file size)
    }

    let fileFilter = async (req, file, cb) => {
        // supported image file mime types
        let allowedMimes = ['image/jpeg', 'image/png', 'image/gif']

        if (lodash.includes(allowedMimes, file.mimetype)) {
            // allow supported image files
            cb(null, true)
        } else {
            // throw error for invalid files
            cb(new Error(app.bundle.getText("errFileType")))
        }
    }

    // setup multer
    const storage = multer.memoryStorage()
    let upload = multer({
        storage: storage,
        limits: limits,
        fileFilter: fileFilter
    })
    const uploadHandler = upload.any()
    app.post('/upload_profile_pic', async (req, res, next) => {
        await uploadHandler(req, res, async (err) => {
            console.log(`in upload handler`)
            if (err instanceof multer.MulterError) {
                if (err.toString() == 'MulterError: File too large') {
                    return res.send(app.bundle.getText("errFileTooLarge")).status(500)
                } else {
                    return res.send(err.toString()).status(500)
                }
            } else if (err) {
                return res.send(err.toString()).status(500)
            }

            //We only allow one file but still pull it out of the files array
            let file
            req.files.forEach((f) => {
                file = f
            })

            //Convert the uploaded content to PNG, rotate based upon metadata and transfer it to a buffer
            const uploadContent = await sharp(file.buffer).rotate().png().toBuffer()
            const uploadContentMeta = await sharp(uploadContent).metadata()

            let body =
                svg.svgHeader(uploadContentMeta.width, uploadContentMeta.height) +
                svg.svgItem(0, 0, 0, uploadContent.toString('base64'), uploadContentMeta.height, uploadContentMeta.width, true) +
                svg.svgItem(0, 0, 0, await loadImageB64('./images/boarder.png'), uploadContentMeta.height, uploadContentMeta.width, true) 

            //Load profile badges from SAP community and add them to the image
            const badgeUrls = await getBadgeUrls(req.body.sapCommunityName)
            await Promise.all(badgeUrls.map((badgeUrl) => download(badgeUrl)))
            const halfImgHeight = uploadContentMeta.height / 2
            const halfImgWidth = uploadContentMeta.width / 2
            const badgeRadius = uploadContentMeta.width / 12      
            for (let i = 0; i < badgeUrls.length; i++) {
                //Parametric equation of a circle: x=radius*cos(angle[rad]) y=radius*sin(angle[rad])
                //However, y and x axis are switched in svg library. So x is the vertical axis in the following code
                const x = halfImgHeight - 0.80 * halfImgHeight * Math.sin(Math.PI * (1.22 + i * 0.14)) - badgeRadius
                const y = halfImgWidth + 0.80 * halfImgWidth * Math.cos(Math.PI * (1.22 + i * 0.14)) - badgeRadius
                const badgePath = getPathFromImgUrl(badgeUrls[i])
                const imgB64 = badgeUrls[i].slice(-3) === 'svg'
                                  ? await loadSvgAsPngB64(badgePath)
                                  : await loadImageB64(badgePath)
                body += svg.svgItem(x, y, 0, imgB64, badgeRadius * 2, badgeRadius * 2, true)
            }

            body += svg.svgEnd()

            const png = await sharp(Buffer.from(body)).png().toBuffer()
            const pngOut = await png.toString('base64')
            res.type("image/png").status(200).send(pngOut)
        })
    })
}