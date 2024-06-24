// @ts-check
import express from 'express'
import * as path from 'path'
import favicon from 'serve-favicon'
import { existsSync as fileExists } from 'fs'

import * as texts from './utils/texts.js'
import * as loader from './utils/loader.js'

/**
 * Build the Express Server and Setup Route Loading dynamically from a /routes folder
 */
export default class ExpressServer {

    /**
    * @constructor
    * Express Server Constructor
    */
    constructor() {
        /** @typeof TextBundle - instance of sap/textbundle */
        this.bundle = texts.getBundle()
        /** @type {Number} - Default Port*/
        this.port = parseInt(process.env.PORT) || 4_000
        if (!(/^[1-9]\d*$/.test(this.port.toString()) && 1 <= 1 * this.port && 1 * this.port <= 65_535)) {
            throw new Error(`${this.port} ${this.bundle.getText("errPort")}`)
        }

        /** @type {String} - Directory relative to root of the project*/
        this.baseDir = process.cwd()
        this.routes = []
        this.app = express()
        this.app.use(express.json())
        this.app.bundle = this.bundle
        this.app.express = express

        //Load Service/Site Favicon
        let faviconFile = path.join(this.baseDir, 'images', 'favicon.ico')
        if (fileExists(faviconFile)) {
            this.app.use(favicon(faviconFile))
        }
    }


    /**
     * Start Express Server
     */
    async start() {
        let app = this.app
        app.baseDir = this.baseDir

        //Load express.js
        loader.importFile('server/express.js', app)

        //Load routes
        loader.importFolder('routes/**/*.js', app)       

        this.httpServer = app.listen(this.port)
        console.log(`Express Server Now Running On http://localhost:${this.port}/`)
    }

    /**
    * Stop Express Server
    */
    stop() {
        this.httpServer.close()
    }

}
