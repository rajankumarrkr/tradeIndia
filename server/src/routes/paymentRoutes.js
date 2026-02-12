const express = require("express");
const router = express.Router();
const multer = require("multer");
const paymentController = require("../controllers/paymentController");
const adminController = require("../controllers/adminController");

// Multer storage config using memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB
    fields: 10,
    files: 1
  }
});

// Enhanced debugging middleware
const uploadMiddleware = (req, res, next) => {
  console.log("=== RECHARGE UPLOAD MIDDLEWARE ===");
  console.log("Content-Type:", req.headers["content-type"]);
  console.log("req.body BEFORE multer:", req.body);
  
  const singleUpload = upload.single("screenshot");
  
  singleUpload(req, res, (err) => {
    if (err) {
      console.error("Multer Error:", err.message);
      return res.status(400).json({ 
        message: "File upload error: " + err.message 
      });
    }
    
    console.log("req.body AFTER multer:", req.body);
    console.log("req.file AFTER multer:", req.file ? req.file.originalname : "NO FILE");
    console.log("=== END UPLOAD MIDDLEWARE ===");
    
    next();
  });
};

router.post("/recharge", uploadMiddleware, paymentController.createRecharge);
router.post("/withdraw", paymentController.createWithdrawal);
router.get("/settings", adminController.getSettings);

module.exports = router;
