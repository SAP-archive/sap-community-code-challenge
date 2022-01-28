import health from '@cloudnative/health-connect'
import Lag from 'event-loop-lag'

/**
 * Configure the Express server and load basic functionality such as health checks and security configuration
 * @param {Object} app - Express application instance
 */
export default function (app) {
    let healthCheck = new health.HealthChecker()
    const lagHealth = () => new Promise((resolve, _reject) => {
        let lag = new Lag(1_000)
        if (lag() > 40) {
            _reject(app.bundle.getText("lagError",[lag()]))
        }
        resolve()
    })
    let lagCheck = new health.LivenessCheck("Event Loop Lag Check", lagHealth)
    healthCheck.registerLivenessCheck(lagCheck)

    app.use('/live', health.LivenessEndpoint(healthCheck))
    app.use('/ready', health.ReadinessEndpoint(healthCheck))
    app.use('/health', health.HealthEndpoint(healthCheck))
    app.use('/healthcheck', health.HealthEndpoint(healthCheck))
}