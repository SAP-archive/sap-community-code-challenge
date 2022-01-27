// @ts-check
import express from 'express'
import * as path from 'path'
import favicon from 'serve-favicon'
import { existsSync as fileExists } from 'fs'
import { promisify } from 'util'
import g from "glob"
const glob = promisify(g)
import * as texts from './utils/texts.js'

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
        this.app.bundle = this.bundle
        this.app.express = express
        this.app.use(favicon(path.join(this.baseDir, 'images', 'favicon.ico')))
    }


    /**
     * Start Express Server
     */
    async start() {
        let app = this.app
        app.baseDir = this.baseDir

        //Load express.js
        let expressFile = path.join(app.baseDir, 'server/express.js')
        if (fileExists(expressFile)) {
            const { default: serverInit } = await import(`file://${expressFile}`)
            serverInit(app)
        }

        //Load routes
        let routesDir = path.join(this.baseDir, 'routes/**/*.js')
        let files = await glob(routesDir)
        this.routerFiles = files
        if (files.length !== 0) {
            for (let file of files) {
                const { default: Route } = await import(`file://${file}`)
                Route(app)
            }
        }

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
