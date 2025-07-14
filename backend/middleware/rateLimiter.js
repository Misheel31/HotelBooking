const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log("🚨 Rate limit exceeded for IP:", req.ip);
    res.status(429).json({
      status: 429,
      error: "Too many login attempts. Please try again later.",
    });
  },
});

module.exports = loginLimiter;
