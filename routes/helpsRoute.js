const express = require("express");

const verifyUsers = require("../middleware/verifyUsers");
const { createHelpsRequist } = require("../controllers/helpsController");

const router = express.Router();

router.post("/create", createHelpsRequist);

module.exports = router;
