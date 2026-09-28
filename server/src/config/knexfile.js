const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
    development: {
        client: 'pg',
        connection: {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        },
        migrations: { directory: '../migrations' },
        seeds: { directory: '../seeds' }
    },
    production: {
        client: 'pg',
        connection: process.env.DATABASE_URL,
        migrations: { directory: '../migrations' },
        seeds: { directory: '../seeds' }
    }
};