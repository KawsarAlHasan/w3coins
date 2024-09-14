const express = require("express");
const {
  getAllwallet,
  deleteWallet,
  miningWallet,
  getMyWallet,
  getTodayMining,
  getAllMiningHistory,
} = require("../controllers/walletController");
const verifyUsers = require("../middleware/verifyUsers");

const router = express.Router();

router.get("/all", getAllwallet);
router.get("/mining-history", getAllMiningHistory);
router.get("/my-wallet", verifyUsers, getMyWallet);
router.get("/today-mining", verifyUsers, getTodayMining);
router.put("/mining", verifyUsers, miningWallet);
router.delete("/delete/:id", verifyUsers, deleteWallet);

module.exports = router;
