const mongoose = require("mongoose");
const BankAccount = require("../models/BankAccount");

const addBankAccount = async (req, res) => {
  try {
    const { userId, accountHolder, bankName, accountNumber, ifsc, branch } =
      req.body;

    if (!userId || !accountHolder || !bankName || !accountNumber || !ifsc) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const bank = await BankAccount.create({
      user: userId,
      accountHolder,
      bankName,
      accountNumber,
      ifsc,
      branch,
    });

    res.status(201).json(bank);
  } catch (err) {
    console.error("Add bank account error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getBankAccounts = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const list = await BankAccount.find({ user: userId }).sort({
      createdAt: -1,
    });

    res.json(list);
  } catch (err) {
    console.error("Get bank accounts error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addBankAccount, getBankAccounts };
