// createBonus

const express = require("express");

const verifyUsers = require("../middleware/verifyUsers");
const {
  createBonus,
  getMyBonusList,
} = require("../controllers/bonusController");

const router = express.Router();

router.post("/create", createBonus);
router.get("/my", verifyUsers, getMyBonusList);

module.exports = router;
