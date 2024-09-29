const express = require("express");

const verifyUsers = require("../middleware/verifyUsers");
const {
  createHelpsRequist,
  getMyHelpsList,
} = require("../controllers/helpsController");

const router = express.Router();

router.post("/create", verifyUsers, createHelpsRequist);
router.get("/my", verifyUsers, getMyHelpsList);

module.exports = router;
