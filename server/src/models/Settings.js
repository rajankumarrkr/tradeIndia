const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
    upiId: { type: String, default: "9009702433@okbizaxis" },
    qrCodeUrl: { type: String, default: "" }, // Could be a URL or base64
});

const Settings = mongoose.model("Settings", settingsSchema);

module.exports = Settings;

