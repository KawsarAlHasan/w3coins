const express = require("express");
const {
  getAllwallet,
  deleteWallet,
  miningWallet,
  getMyWallet,
} = require("../controllers/walletController");
const verifyUsers = require("../middleware/verifyUsers");

const router = express.Router();

router.get("/all", getAllwallet);
router.get("/my-wallet", verifyUsers, getMyWallet);
// router.post("/create", verifyUsers, createWallet);
router.put("/mining", verifyUsers, miningWallet);
router.delete("/delete/:id", verifyUsers, deleteWallet);

module.exports = router;
