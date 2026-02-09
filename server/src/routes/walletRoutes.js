const express = require("express");
const router = express.Router();
const walletController = require("../controllers/walletController");

router.get("/:userId", walletController.getWalletInfo);
router.get("/team/:userId", walletController.getTeamInfo);
router.get("/transactions/:userId", walletController.getUserTransactions);

module.exports = router;
