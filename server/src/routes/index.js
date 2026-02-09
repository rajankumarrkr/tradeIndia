const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const planRoutes = require("./planRoutes");
const walletRoutes = require("./walletRoutes");
const paymentRoutes = require("./paymentRoutes");
const bankRoutes = require("./bankRoutes");
const adminRoutes = require("./adminRoutes");

router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "TradeIndia API running" });
});

router.use("/auth", authRoutes);
router.use("/plans", planRoutes);
router.use("/wallet", walletRoutes);
router.use("/", paymentRoutes); // paymentRoutes contains /recharge and /withdraw
router.use("/bank-accounts", bankRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
