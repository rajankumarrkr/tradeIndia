const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const paymentController = require("../controllers/paymentController");
const adminController = require("../controllers/adminController");

// Multer storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = "uploads/";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

router.post("/recharge", upload.single("screenshot"), paymentController.createRecharge);
router.post("/withdraw", paymentController.createWithdrawal);
router.get("/settings", adminController.getSettings);

module.exports = router;
