const mongoose = require("mongoose");
const fs = require("fs");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const BankAccount = require("../models/BankAccount");

const MIN_AMOUNT = 300;
const GST_PERCENT = 15;

const ensureWallet = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.warn(`Invalid userId format in payment: ${userId}`);
    return null;
  }
  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    wallet = await Wallet.create({ user: userId, balance: 0 });
  }
  return wallet;
};

const cloudinary = require("../config/cloudinaryConfig");

// RECHARGE: create recharge request (pending, manual UPI)
const createRecharge = async (req, res) => {
  console.log("=== CREATE RECHARGE HANDLER V3.4.1 ===");
  try {
    console.log("Headers:", req.headers["content-type"]);
    console.log("req.body type:", typeof req.body);
    console.log("req.body content:", req.body);
    console.log("req.file present:", !!req.file);

    // Check Cloudinary Config
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.error("Cloudinary environment variables are MISSING!");
      return res.status(500).json({ message: "Server configuration error" });
    } else {
      console.log("Cloudinary environment variables are present.");
    }

    // CRITICAL: Validate req.body exists and is an object
    if (!req.body || typeof req.body !== 'object') {
      console.error("CRITICAL ERROR: req.body is invalid!", req.body);
      return res.status(400).json({ 
        message: "Request body parsing failed. Body type: " + typeof req.body 
      });
    }

    const { userId, amount, utr, upiId } = req.body;
    console.log("Extracted fields:", { userId, amount, utr, upiId });

    // Validate all required fields
    if (!userId || !amount || !utr || !upiId) {
      console.error("Missing required fields:", { 
        hasUserId: !!userId, 
        hasAmount: !!amount, 
        hasUtr: !!utr, 
        hasUpiId: !!upiId 
      });
      return res.status(400).json({ 
        message: "All fields are required (userId, amount, utr, upiId)" 
      });
    }

    // Validate file upload
    if (!req.file) {
      console.error("req.file is missing!");
      return res.status(400).json({ 
        message: "Please upload payment screenshot" 
      });
    }

    console.log("File detected:", req.file.originalname, "Size:", req.file.size);

    // Validate amount
    const num = Number(amount);
    if (isNaN(num) || num < MIN_AMOUNT) {
      return res.status(400).json({ 
        message: `Minimum recharge amount is ${MIN_AMOUNT}` 
      });
    }

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error("Invalid userId format:", userId);
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Upload to Cloudinary
    console.log("Starting Cloudinary Upload...");
    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "recharges" },
          (error, result) => {
            if (error) {
              console.error("Cloudinary Callback Error:", error);
              reject(error);
            } else {
              console.log("Cloudinary Upload Success:", result.secure_url);
              resolve(result);
            }
          }
        );
        stream.end(req.file.buffer);
      });
    };

    let cloudinaryResult;
    try {
      cloudinaryResult = await uploadToCloudinary();
    } catch (uploadErr) {
      console.error("Cloudinary Upload Promise Failed:", uploadErr);
      return res.status(500).json({ 
        message: "Cloudinary upload failed: " + uploadErr.message 
      });
    }

    const screenshot = cloudinaryResult.secure_url;

    // Create transaction
    const tx = await Transaction.create({
      user: userId,
      type: "recharge",
      amount: num,
      status: "pending",
      meta: { utr, upiId, screenshot },
    });

    console.log("Recharge Transaction Created:", tx._id);

    res.status(201).json({
      message: "Recharge request created, waiting for admin approval",
      transaction: tx,
    });
  } catch (err) {
    console.error("Create recharge FATAL error:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({ 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// WITHDRAW: only amount deducted; GST shown in UI / meta
const createWithdrawal = async (req, res) => {
  try {
    const { userId, amount, bankAccountId } = req.body;

    if (!userId || !amount || !bankAccountId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (amount < MIN_AMOUNT) {
      return res
        .status(400)
        .json({ message: `Minimum withdrawal amount is ${MIN_AMOUNT}` });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const wallet = await ensureWallet(userId);
    if (!wallet) {
      return res.status(400).json({ message: "Invalid wallet setup" });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient wallet balance" });
    }

    const bankAccount = await BankAccount.findOne({
      _id: bankAccountId,
      user: userId,
    });
    if (!bankAccount) {
      return res.status(400).json({ message: "Invalid bank account" });
    }

    wallet.balance -= amount;
    await wallet.save();

    const gst = (amount * GST_PERCENT) / 100;

    const bankDetails = {
      accountHolder: bankAccount.accountHolder,
      bankName: bankAccount.bankName,
      accountNumber: bankAccount.accountNumber,
      ifsc: bankAccount.ifsc,
      branch: bankAccount.branch || "N/A",
    };

    console.log(`Creating withdrawal for user ${userId}, amount ${amount}, bank: ${bankDetails.accountNumber}`);

    const tx = await Transaction.create({
      user: userId,
      type: "withdraw",
      amount,
      status: "pending",
      meta: {
        bankAccountId: bankAccount._id,
        bankDetails,
        gst,
      },
    });

    res.status(201).json({
      message:
        "Withdrawal request created, amount will be processed by admin",
      transaction: tx,
      walletBalance: wallet.balance,
    });
  } catch (err) {
    console.error("Create withdrawal error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createRecharge,
  createWithdrawal,
};
