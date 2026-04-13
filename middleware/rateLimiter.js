const rateLimit = require("express-rate-limit");
const logger = require("../config/logger");

// limit: 5 requests per minute per user
const orderRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    keyGenerator: (req) => {
        return req.user?.user_id || req.ip;
    },
    handler: (req, res, next, options) => {
        logger.warn(`Rate limit hit for user: ${req.user?.user_id || "anonymous"}`);
        return res.status(429).json({
            message: "Too many orders, please try again later",
            user: req.user?.user_id || "anonymous",
        })
    },
});

module.exports = orderRateLimiter;