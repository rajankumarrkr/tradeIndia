const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    referralCode: { type: String, unique: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    role: { type: String, enum: ["user"], default: "user" },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// UPDATED: no next argument, no next() calls
// UPDATED: No password hashing
// userSchema.pre("save", ... ) removed

userSchema.methods.matchPassword = function (entered) {
  // Direct comparison for plain text
  return this.password === entered;
};

userSchema.methods.generateReferralCode = function () {
  const suffix = String(this._id).slice(-4);
  const mobilePart = this.mobile.slice(-4);
  return `${mobilePart}${suffix}`;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
