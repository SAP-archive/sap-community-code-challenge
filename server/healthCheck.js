import health from '@cloudnative/health-connect'
import Lag from 'event-loop-lag'

export default function (app) {
    let healthcheck = new health.HealthChecker()
    const lagHealth = () => new Promise((resolve, _reject) => {
        let lag = new Lag(1_000)
        if (lag() > 40) {
            _reject(app.bundle.getText("lagError",[lag()]))
        }
        resolve()
    })
    let lagCheck = new health.LivenessCheck("Event Loop Lag Check", lagHealth)
    healthcheck.registerLivenessCheck(lagCheck)

    app.use('/live', health.LivenessEndpoint(healthcheck))
    app.use('/ready', health.ReadinessEndpoint(healthcheck))
    app.use('/health', health.HealthEndpoint(healthcheck))
    app.use('/healthcheck', health.HealthEndpoint(healthcheck))
}