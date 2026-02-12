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

// RECHARGE: create recharge request (pending, manual UPI)
const createRecharge = async (req, res) => {
  try {
    console.log("RECHARGE REQUEST HEADERS:", req.headers);
    console.log("RECHARGE REQUEST BODY TYPE:", typeof req.body);

    if (!req.body) {
      console.error("CRITICAL: req.body is undefined!");
      return res.status(400).json({ message: "Request body is missing" });
    }

    const { userId, amount, utr, upiId } = req.body;
    const screenshot = req.file ? req.file.path : null;

    console.log("Create Recharge Request:", { userId, amount, utr, upiId, screenshot });

    if (!userId || !amount || !utr || !upiId) {
      if (screenshot && fs.existsSync(screenshot)) {
        fs.unlinkSync(screenshot);
      }
      return res.status(400).json({ message: "All fields are required" });
    }

    const num = Number(amount);
    if (isNaN(num) || num < MIN_AMOUNT) {
      if (screenshot && fs.existsSync(screenshot)) {
        fs.unlinkSync(screenshot);
      }
      return res
        .status(400)
        .json({ message: `Minimum recharge amount is ${MIN_AMOUNT}` });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      if (screenshot && fs.existsSync(screenshot)) {
        fs.unlinkSync(screenshot);
      }
      return res.status(400).json({ message: "Invalid user ID format" });
    }

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
    console.error("Create recharge error DETAILS:", {
      message: err.message,
      stack: err.stack,
      body: req.body,
      file: req.file
    });
    res.status(500).json({ message: "Server error: " + err.message });
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
