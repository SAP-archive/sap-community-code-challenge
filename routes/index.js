import * as path from 'path';
import { promises as fs } from 'fs';
import showdown from 'showdown';
const { Converter } = showdown;

/**
 * Entry Point Route
 * @param {Object} app - Express application instance
 */
export default function (app) {
    app.use('/images', app.express.static(path.join(app.baseDir, './images')));
    app.use('/i18n', app.express.static(path.join(app.baseDir, './_i18n')));

    //Load project README.md as the root page of the service
    app.get('/', async (req, res) => {
        try {
            const mdReadMe = await fs.readFile(path.resolve(app.baseDir, './README.md'), 'utf-8');
            const converter = new Converter();
            const html = converter.makeHtml(mdReadMe);
            res.type('text/html').status(200).send(html);
        } catch (error) {
            app.logger.error(error);
            res.status(500).send(error.toString());
        }
    });
}
