module.exports = {
    apps: [{
        name: "Soundcore API @NEXT",
        script: "main.js",
        increment_var: "PORT",
        instances: 1,
        autorestart: true,
        watch: false,
        time: false,
        exec_interpreter: "node",
        env: {
            PORT: 3002
        }
    }]
}