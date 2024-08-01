const express = require("express");
const {
  getAllwallet,
  getSingleWallet,
  createWallet,
  deleteWallet,
  updateWallet,
} = require("../controllers/walletController");
const verifyUsers = require("../middleware/verifyUsers");

const router = express.Router();

router.get("/all", getAllwallet);
router.get("/:id", getSingleWallet);
router.post("/create", verifyUsers, createWallet);
router.put("/update/:id", verifyUsers, updateWallet);
router.delete("/delete/:id", verifyUsers, deleteWallet);

module.exports = router;
