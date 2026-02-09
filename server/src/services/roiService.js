const Investment = require("../models/Investment");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");

const runDailyROI = async () => {
    console.log("Running daily ROI job at:", new Date().toLocaleString());

    try {
        const investments = await Investment.find({ isActive: true });
        let count = 0;

        for (const inv of investments) {
            // Robustness check: skip if already credited today
            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            if (inv.lastCreditDate && new Date(inv.lastCreditDate) >= todayStart) {
                continue;
            }

            const wallet = await Wallet.findOne({ user: inv.user });

            if (!wallet) continue;

            // credit ROI
            wallet.balance += inv.dailyIncome;
            wallet.totalIncome += inv.dailyIncome;
            await wallet.save();

            // transaction record
            await Transaction.create({
                user: inv.user,
                type: "roi",
                amount: inv.dailyIncome,
                status: "success",
                meta: { investmentId: inv._id },
            });

            // update investment
            inv.daysCompleted += 1;
            inv.lastCreditDate = new Date();

            if (inv.daysCompleted >= inv.durationDays) {
                inv.isActive = false;
            }

            await inv.save();
            count++;
        }

        console.log(`Daily ROI job completed. Credited ${count} investments.`);
        return count;
    } catch (error) {
        console.error("Daily ROI job failed:", error.message);
        throw error;
    }
};

module.exports = {
    runDailyROI,
};
