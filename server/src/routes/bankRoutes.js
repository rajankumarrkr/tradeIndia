const express = require("express");
const router = express.Router();
const bankAccountController = require("../controllers/bankAccountController");

router.post("/", bankAccountController.addBankAccount);
router.get("/", bankAccountController.getBankAccounts);

module.exports = router;
