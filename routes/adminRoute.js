const express = require("express");

const verifyAdmin = require("../middleware/verifyAdmin");
const {
  adminLogin,
  getMeAdmin,
  updateAdminPassword,
  updateAdmin,
} = require("../controllers/adminController");

const router = express.Router();

router.get("/me", verifyAdmin, getMeAdmin);
router.post("/login", adminLogin);
router.put("/update/:id", verifyAdmin, updateAdmin);
router.put("/update-password/:id", verifyAdmin, updateAdminPassword);

module.exports = router;
