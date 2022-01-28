import * as path from 'path'
import fs from 'fs'

/**       
 * Route for serving the Frontend UI components
 * @param {Object} app - Express application instance
 */
 export default function (app) {


     app.get('/appconfig/fioriSandboxConfig.json', async (req, res) => {
        try {
            let appConfig = JSON.parse(fs.readFileSync(path.join(app.baseDir, './app/appconfig/fioriSandboxConfig.json')))
            appConfig.applications['profilepic-ui'].title = app.bundle.getText("appTitle")
            appConfig.applications["profilepic-ui"].description = app.bundle.getText("appDescription")
            res.type("application/json").status(200).send(appConfig)           
        } catch (error) {
            app.logger.error(error)
            res.status(500).send(error.toString())
        }
    }) 
    app.use('/profilePic', app.express.static(path.join(app.baseDir, './app/profilePic')))
 }