/* import * as passport from 'passport'
import * as xssec from '@sap/xssec'
import * as xsenv from '@sap/xsenv' */

/**
 * Configure the security aspects of the Express server
 * @param {Object} app - Express application instance
 */
export default function (app) {
    //Only needed if service requires authentication and this one won't
    /* 
     passport.use("JWT", new xssec.JWTStrategy(xsenv.getServices({
           uaa: {
               tag: "xsuaa"
           }
       }).uaa))
       app.use(passport.initialize()) 
       app.use(
           passport.authenticate("JWT", {
               session: false
           })
       ) */
}
