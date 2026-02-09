const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const adminController = require("../controllers/adminController");
const planController = require("../controllers/planController");

// Multer storage config for settings
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = "uploads/settings/";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, "qr-code-" + Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

router.get("/users", adminController.getUsers);
router.post("/users/:userId/block", adminController.toggleUserBlock);
router.post("/add-amount", adminController.addAmountToWallet);
router.get("/pending-transactions", adminController.getPendingTransactions);
router.post("/approve-recharge/:txId", adminController.approveRecharge);
router.post("/approve-withdrawal/:txId", adminController.approveWithdrawal);
router.get("/settings", adminController.getSettings);
router.post("/settings", adminController.updateSettings);
router.post("/settings/qr", upload.single("qrCode"), adminController.uploadQR);
router.post("/trigger-roi", adminController.triggerROIManually);

// Plan Management
router.post("/plans", planController.createPlan);
router.put("/plans/:planId", planController.updatePlan);
router.delete("/plans/:planId", planController.deletePlan);

module.exports = router;
