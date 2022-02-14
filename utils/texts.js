import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const TextBundle = require('@sap/textbundle').TextBundle;
import langParser from 'accept-language-parser';
import path from 'path';

/**
 * Get Locale from HTTP Request Header
 * @param {*} req - HTTP Request object from Express
 * @returns {string}
 */
export function getLocale(req) {
    if (req) {
        let lang = req.headers['accept-language'];
        if (!lang) {
            return;
        }
        let arr = langParser.parse(lang);
        if (!arr || arr.length < 1) {
            return;
        }
        let locale = arr[0].code;
        if (arr[0].region) {
            locale += '-' + arr[0].region;
        }
        return locale;
    } else {
        return;
    }
}

/**
 * Get Text Bundle from sap/textbundle
 * @param {*} req - HTTP Request object from Express
 * @returns @typeof TextBundle - instance of sap/textbundle
 */
export function getBundle(req) {
    return new TextBundle(path.resolve(process.cwd(), './_i18n/messages'), getLocale(req));
}
