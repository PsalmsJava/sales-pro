require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const requestLogger = require('./middleware/requestLogger');
const logger = require('./utils/logger');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Special rate limit for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many login attempts, please try again later.'
});
app.use('/api/auth/login', authLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// ==================== ALL API ROUTES ====================

// Authentication Routes
app.use('/api/auth', require('./routes/auth.routes'));

// Product Management Routes
app.use('/api/products', require('./routes/product.routes'));

// Order Management Routes
app.use('/api/orders', require('./routes/order.routes'));

// Commission & Earnings Routes
app.use('/api/commissions', require('./routes/commission.routes'));

// Dispatch Partner Routes
app.use('/api/dispatch', require('./routes/dispatch.routes'));

// Admin Routes (will be added in this step)
app.use('/api/admin', require('./routes/admin.routes'));

// Payment Routes (will be added in this step)
app.use('/api/payments', require('./routes/payment.routes'));

// Add after dispatch routes
app.use('/api/sales-reps', require('./routes/salesRep.routes'));

// ========================================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
        requestId: req.requestId,
        endpoint: req.originalUrl,
        method: req.method
    });

    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
        requestId: req.requestId
    });
});

const PORT = process.env.PORT || 5000;

// Run pending migrations on boot, then start listening.
// render.yaml does not run migrations separately, so this guarantees
// the schema (roles, constraints) is always up to date in production.
const startServer = async () => {
    try {
        const db = require('./config/database');
        const [, appliedMigrations] = await db.migrate.latest();
        if (appliedMigrations && appliedMigrations.length > 0) {
            logger.info('Applied database migrations on boot', { migrations: appliedMigrations });
        } else {
            logger.info('Database migrations are up to date');
        }
    } catch (error) {
        logger.error('Database migration failed on boot', { error: error.message, stack: error.stack });
    }

    app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
        logger.info(`API available at http://localhost:${PORT}/api`);
    });
};

startServer();

module.exports = app;