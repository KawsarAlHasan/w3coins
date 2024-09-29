// createBonus

const express = require("express");

const verifyUsers = require("../middleware/verifyUsers");
const { createBonus } = require("../controllers/bonusController");

const router = express.Router();

router.post("/create", createBonus);

// router.get("/all", getAllUsers); //all users for admin
// router.get("/me", verifyUsers, getMeUsers);
// router.post("/login", usersLogin);
// router.put(
//   "/update",
//   uploadImage.fields([
//     { name: "profile_image", maxCount: 1 },
//     { name: "nid_image", maxCount: 1 },
//   ]),
//   verifyUsers,
//   updateUser
// );
// router.put("/update-password/:id", verifyUsers, updateUserPassword);

// router.delete("/delete/:id", verifyUsers, deleteUser);
// router.put("/update-verify-status/:id", verifyStatusUpdate);
// router.get("/:id", getSingleUser);

module.exports = router;
