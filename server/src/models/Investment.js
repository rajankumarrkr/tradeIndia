const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },
    investAmount: { type: Number, required: true },
    dailyIncome: { type: Number, required: true },
    durationDays: { type: Number, required: true, default: 99 },
    totalIncome: { type: Number, required: true },
    daysCompleted: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, required: true, default: true },
    lastCreditDate: { type: Date, default: null },
  },
  { timestamps: true }
);

const Investment = mongoose.model("Investment", investmentSchema);

module.exports = Investment;
