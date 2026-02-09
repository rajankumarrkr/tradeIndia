const User = require("../models/User");

const register = async (req, res) => {
  try {
    const { name, mobile, password, confirmPassword, referralCode } = req.body;

    if (!name || !mobile || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existing = await User.findOne({ mobile });
    if (existing) {
      return res.status(400).json({ message: "Mobile already registered" });
    }

    let referredBy = null;
    if (referralCode) {
      const refUser = await User.findOne({ referralCode });
      if (!refUser) {
        return res.status(400).json({ message: "Invalid referral code" });
      }
      referredBy = refUser._id;
    }

    const user = new User({
      name,
      mobile,
      password,
      referredBy,
    });

    console.log(`Registering user ${name} (${mobile}), referredBy: ${referredBy}`);
    await user.save();

    if (!user.referralCode) {
      user.referralCode = user.generateReferralCode();
      await user.save();
    }

    res.status(201).json({
      message: "Registered successfully",
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        referralCode: user.referralCode,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Hardcoded Admin Login (Updated credentials)
    if (mobile === "svcet" && password === "svcet@123") {
      return res.json({
        message: "Admin login successful",
        user: {
          id: "000000000000000000000000", // Valid ObjectId format to avoid CastError
          name: "Administrator",
          mobile: "svcet",
          isAdmin: true
        }
      });
    }

    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "Account is blocked. Contact support." });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        referralCode: user.referralCode,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  register,
  login,
};
