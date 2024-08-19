const express = require("express");
const {
  getAllwallet,
  getSingleWallet,
  createWallet,
  deleteWallet,
  miningWallet,
} = require("../controllers/walletController");
const verifyUsers = require("../middleware/verifyUsers");

const router = express.Router();

router.get("/all", getAllwallet);
router.get("/:id", getSingleWallet);
router.post("/create", verifyUsers, createWallet);
router.put("/mining", verifyUsers, miningWallet);
router.delete("/delete/:id", verifyUsers, deleteWallet);

module.exports = router;
