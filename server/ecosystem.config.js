module.exports = {
    apps: [{
        name: 'salespro-api',
        script: './src/app.js',
        instances: 'max',
        exec_mode: 'cluster',
        env: {
            NODE_ENV: 'production'
        },
        error_file: './logs/error.log',
        out_file: './logs/output.log',
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        max_memory_restart: '1G',
        autorestart: true,
        watch: false
    }]
};