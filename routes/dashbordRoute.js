const express = require("express");
const {
  getTotalCoins,
  getCoinRate,
  updateCoinRate,
} = require("../controllers/dashboardController");

const router = express.Router();

router.get("/total-coins", getTotalCoins);
router.get("/coin-price", getCoinRate);
router.put("/coin-price", updateCoinRate);
// router.get("/my-wallet", verifyUsers, getMyWallet);
// router.get("/today-mining", verifyUsers, getTodayMining);
// router.put("/mining", verifyUsers, miningWallet);
// router.delete("/delete/:id", verifyUsers, deleteWallet);

module.exports = router;
