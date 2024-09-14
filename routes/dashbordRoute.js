const express = require("express");
const {
  getTotalCoins,
  getCoinRate,
  updateCoinRate,
  newUserBonusGet,
  newUserBonusUpdate,
  getReferralBonus,
  updateReferralBonus,
} = require("../controllers/dashboardController");

const router = express.Router();

router.get("/total-coins", getTotalCoins);
router.get("/coin-price", getCoinRate);
router.put("/coin-price", updateCoinRate);

router.get("/new-user-bonus", newUserBonusGet);
router.put("/new-user-bonus", newUserBonusUpdate);

router.get("/reffal-bonus", getReferralBonus);
router.put("/reffal-bonus", updateReferralBonus);

module.exports = router;
