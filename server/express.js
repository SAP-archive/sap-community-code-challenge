import logging from '@sap/logging'
import * as loader from '../utils/loader.js'

/**
 * Configure the Express server and load basic functionality such as health checks and security configuration
 * @param {Object} app - Express application instance
 */
export default async function (app) {
    let appContext = logging.createAppContext({})
    app.logger = appContext.createLogContext().getLogger('/Application')

    app.set('etag', false)

    loader.importFile('server/healthCheck.js', app)
    loader.importFile('server/overloadProtection.js', app)
    loader.importFile('server/expressSecurity.js', app)

    app.use(logging.middleware({ appContext: appContext, logNetwork: true }))
}