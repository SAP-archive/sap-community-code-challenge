import sharp from 'sharp';
import multer from 'multer';
import lodash from 'lodash';
import * as svg from '../utils/svgRender.js';
import { promises as fs } from 'fs';
import * as path from 'path';

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
        return await fs.readFile(path.resolve(app.baseDir, image), {
            encoding: 'base64'
        });
    }

    const limits = {
        files: 1, // allow only 1 file per request
        fileSize: 1024 * 1024 * 20 // 20 MB (max file size)
    };

    let fileFilter = async (req, file, cb) => {
        // supported image file mime types
        let allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];

        if (lodash.includes(allowedMimes, file.mimetype)) {
            // allow supported image files
            cb(null, true);
        } else {
            // throw error for invalid files
            cb(new Error(app.bundle.getText('error.FileType')));
        }
    };

    // setup multer
    const storage = multer.memoryStorage();
    let upload = multer({
        storage: storage,
        limits: limits,
        fileFilter: fileFilter
    });
    const uploadHandler = upload.any();
    app.post('/upload_profile_pic', async (req, res, next) => {
        await uploadHandler(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                if (err.toString() == 'MulterError: File too large') {
                    return res.send(app.bundle.getText('error.FileTooLarge')).status(500);
                } else {
                    return res.send(err.toString()).status(500);
                }
            } else if (err) {
                return res.send(err.toString()).status(500);
            }

            //We only allow one file but still pull it out of the files array
            let file;
            req.files.forEach((f) => {
                file = f;
            });

            //Convert the uploaded content to PNG, rotate based upon metadata and transfer it to a buffer
            const uploadContent = await sharp(file.buffer).rotate().png().toBuffer();
            const uploadContentMeta = await sharp(uploadContent).metadata();
            let body =
                svg.svgHeader(uploadContentMeta.width, uploadContentMeta.height) +
                svg.svgItem(
                    0,
                    0,
                    0,
                    uploadContent.toString('base64'),
                    uploadContentMeta.height,
                    uploadContentMeta.width,
                    true
                ) +
                svg.svgItem(
                    0,
                    0,
                    0,
                    await loadImageB64('./images/border.png'),
                    uploadContentMeta.height,
                    uploadContentMeta.width,
                    true
                ) +
                svg.svgEnd();

            const png = await sharp(Buffer.from(body)).png().toBuffer();
            const pngOut = await png.toString('base64');
            res.type('image/png').status(200).send(pngOut);
        });
    });
}
