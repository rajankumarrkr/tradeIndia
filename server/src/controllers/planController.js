const Plan = require("../models/Plan");
const Wallet = require("../models/Wallet");
const Investment = require("../models/Investment");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const mongoose = require("mongoose");

const ensureWallet = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.warn(`Invalid userId format: ${userId}`);
    return null;
  }
  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    wallet = await Wallet.create({ user: userId, balance: 0 });
  }
  return wallet;
};

const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ investAmount: 1 });
    res.json(plans);
  } catch (err) {
    console.error("Get plans error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const createPlan = async (req, res) => {
  try {
    const { name, investAmount, dailyIncome, durationDays, totalIncome } = req.body;
    const newPlan = new Plan({
      name,
      investAmount,
      dailyIncome,
      durationDays,
      totalIncome: totalIncome || dailyIncome * durationDays,
    });
    await newPlan.save();
    res.status(201).json({ message: "Plan created successfully", plan: newPlan });
  } catch (err) {
    console.error("Create plan error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const updatePlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const updatedPlan = await Plan.findByIdAndUpdate(planId, req.body, { new: true });
    if (!updatedPlan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    res.json({ message: "Plan updated successfully", plan: updatedPlan });
  } catch (err) {
    console.error("Update plan error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const deletePlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const deletedPlan = await Plan.findByIdAndDelete(planId);
    if (!deletedPlan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    res.json({ message: "Plan deleted successfully" });
  } catch (err) {
    console.error("Delete plan error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const buyPlan = async (req, res) => {
  try {
    const { userId, planId } = req.body;

    if (!userId || !planId) {
      return res.status(400).json({ message: "userId and planId are required" });
    }

    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    const wallet = await ensureWallet(userId);
    if (!wallet) {
      return res.status(400).json({ message: "Invalid user or wallet setup" });
    }

    if (wallet.balance < plan.investAmount) {
      return res.status(400).json({ message: "Insufficient wallet balance" });
    }

    wallet.balance -= plan.investAmount;
    await wallet.save();

    const investment = await Investment.create({
      user: userId,
      plan: plan._id,
      investAmount: plan.investAmount,
      dailyIncome: plan.dailyIncome,
      durationDays: plan.durationDays,
      totalIncome: plan.totalIncome,
      daysCompleted: 0,
      isActive: true,
    });

    await Transaction.create({
      user: userId,
      type: "plan_buy",
      amount: plan.investAmount,
      status: "success",
      meta: { planId: plan._id },
    });

    res.status(201).json({
      message: "Plan purchased successfully",
      investment,
      walletBalance: wallet.balance,
    });
  } catch (err) {
    console.error("Buy plan error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserInvestments = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const investments = await Investment.find({ user: userId })
      .populate("plan")
      .sort({ createdAt: -1 });
    res.json(investments);
  } catch (err) {
    console.error("Get user investments error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getPlans, createPlan, updatePlan, deletePlan, buyPlan, getUserInvestments };
