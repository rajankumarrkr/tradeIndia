const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const paymentController = require("../controllers/paymentController");
const adminController = require("../controllers/adminController");

// Multer storage config using memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/recharge", upload.single("screenshot"), paymentController.createRecharge);
router.post("/withdraw", paymentController.createWithdrawal);
router.get("/settings", adminController.getSettings);

module.exports = router;
