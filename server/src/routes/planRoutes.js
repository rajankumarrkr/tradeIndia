const express = require("express");
const router = express.Router();
const planController = require("../controllers/planController");

router.get("/", planController.getPlans);
router.post("/buy", planController.buyPlan);
router.get("/user/:userId", planController.getUserInvestments);

module.exports = router;
