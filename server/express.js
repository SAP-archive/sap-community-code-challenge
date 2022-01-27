import logging from '@sap/logging'
import { existsSync as fileExists } from 'fs'
import * as path from 'path'

export default async function (app) {
    let appContext = logging.createAppContext({})
    app.logger = appContext.createLogContext().getLogger('/Application')

    app.set('etag', false)

    //Load healthCheck.js
    let healthCheckFile = path.join(app.baseDir, 'server/healthCheck.js')
    if (fileExists(healthCheckFile)) {
        const { default: healthCheck } = await import(`file://${healthCheckFile}`)
        healthCheck(app)
    }
    //Load overloadProtection.js
    let overloadProtectionFile = path.join(app.baseDir, 'server/overloadProtection.js')
    if (fileExists(overloadProtectionFile)) {
        const { default: overloadProtection } = await import(`file://${overloadProtectionFile}`)
        overloadProtection(app)
    }
    //Load expressSecurity.js
    let expressSecurityFile = path.join(app.baseDir, 'server/expressSecurity.js')
    if (fileExists(expressSecurityFile)) {
        const { default: expressSecurity } = await import(`file://${expressSecurityFile}`)
        expressSecurity(app)
    }

    app.use(logging.middleware({ appContext: appContext, logNetwork: true }))
}