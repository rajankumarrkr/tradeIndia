const mongoose = require("mongoose");
const Wallet = require("../models/Wallet");
const Plan = require("../models/Plan");
const Investment = require("../models/Investment");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

const ensureWallet = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.warn(`Invalid userId format: ${userId}`);
    return null;
  }
  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    wallet = await Wallet.create({ user: userId });
  }
  return wallet;
};

const getWalletInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    const wallet = await ensureWallet(userId);
    if (!wallet) return res.status(400).json({ message: "Invalid wallet" });

    // Sum total recharge from successful transactions
    const totalRechargeResult = await Transaction.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), type: "recharge", status: "success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalRecharge = totalRechargeResult[0]?.total || 0;

    res.json({
      balance: wallet.balance,
      totalIncome: wallet.totalIncome,
      totalRecharge: totalRecharge
    });
  } catch (err) {
    console.error("Get wallet info error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getTeamInfo = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const userObjId = new mongoose.Types.ObjectId(userId);

    // LEVEL 1: Direct referrals
    // Defensively check for both ObjectId and string if there's any inconsistency
    const level1Users = await User.find({
      $or: [
        { referredBy: userObjId },
        { referredBy: userId }
      ]
    }).select("_id");
    const level1Ids = level1Users.map(u => u._id);

    // LEVEL 2: Referrals of level 1
    let level2Ids = [];
    if (level1Ids.length > 0) {
      const level2Users = await User.find({
        $or: [
          { referredBy: { $in: level1Ids } },
          { referredBy: { $in: level1Ids.map(id => id.toString()) } }
        ]
      }).select("_id");
      level2Ids = level2Users.map(u => u._id);
    }

    // LEVEL 3: Referrals of level 2
    let level3Count = 0;
    if (level2Ids.length > 0) {
      level3Count = await User.countDocuments({
        $or: [
          { referredBy: { $in: level2Ids } },
          { referredBy: { $in: level2Ids.map(id => id.toString()) } }
        ]
      });
    }

    const teamSize = level1Ids.length + level2Ids.length + level3Count;

    console.log(`[TEAM INFO DEBUG] User: ${userId}`);
    console.log(`- L1 found: ${level1Ids.length}`);
    console.log(`- L2 found: ${level2Ids.length}`);
    console.log(`- L3 found: ${level3Count}`);
    console.log(`- Total teamSize: ${teamSize}`);

    const teamIncomeResult = await Transaction.aggregate([
      { $match: { user: userObjId, type: "team_income" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const teamIncome = teamIncomeResult[0]?.total || 0;

    res.json({ teamSize, teamIncome });
  } catch (err) {
    console.error("Get team info error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserTransactions = async (req, res) => {
  try {
    const { userId } = req.params;
    const transactions = await Transaction.find({ user: userId }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getWalletInfo, getTeamInfo, getUserTransactions };
