import pino from "pino";

const config = {
    serverUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    env: process.env.NODE_ENV,
    publicUrl: process.env.NEXTAUTH_URL,
}

const logger = pino({
    transport: {
        target: "pino-pretty",
        options: {
            colorize: true
        }
    },
    browser: {
        asObject: true,
        transmit: {
            send: (level, logEvent) => {
                const msg = String(logEvent.messages[0]);

                const headers = {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
                    type: 'application/json'
                }

                let blob = new Blob([JSON.stringify({ msg, level })], headers);
                navigator.sendBeacon(`${config.serverUrl}/log`, blob);
            },
        }
    },
    
})

export const info = msg => logger.info(String(msg));
export const error = (msg, error) => logger.error(error, String(msg));

export default logger;