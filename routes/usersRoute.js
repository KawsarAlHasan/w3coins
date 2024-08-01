const express = require("express");

const {
  usersLogin,
  usersSignup,
  getAllUsers,
  getMeUsers,
  deleteUser,
  getSingleUser,
  updateUserPassword,
  updateUser,
} = require("../controllers/usersController");
const verifyUsers = require("../middleware/verifyUsers");
const uploadImage = require("../middleware/imagesUploader");

const router = express.Router();

router.get("/all", getAllUsers); //all users for admin
router.get("/me", verifyUsers, getMeUsers);
router.get("/:id", getSingleUser);
router.post("/signup", usersSignup);
router.post("/login", usersLogin);
router.put(
  "/update/:id",
  uploadImage.fields([
    { name: "profile_image", maxCount: 1 },
    { name: "nid_image", maxCount: 1 },
  ]),
  verifyUsers,
  updateUser
);
router.put("/update-password/:id", verifyUsers, updateUserPassword);

router.delete("/delete/:id", verifyUsers, deleteUser);

module.exports = router;
