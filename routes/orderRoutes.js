const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { createOrder, cancelOrder, getOrders } = require("../controllers/orderController");
const orderRateLimiter = require("../middleware/rateLimiter");

router.post("/", authMiddleware, orderRateLimiter, createOrder);
router.patch("/:id/cancel", authMiddleware, cancelOrder);
router.get("/",authMiddleware, orderRateLimiter, getOrders);
module.exports = router;