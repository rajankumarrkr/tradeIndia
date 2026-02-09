const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    investAmount: { type: Number, required: true },
    dailyIncome: { type: Number, required: true },
    durationDays: { type: Number, required: true, default: 99 },
    totalIncome: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Plan = mongoose.model("Plan", planSchema);

module.exports = Plan;
