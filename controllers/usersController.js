const db = require("../config/db");
const bcrypt = require("bcrypt");
const { generateUsersToken } = require("../config/usersToken");

// get all Users
exports.getAllUsers = async (req, res) => {
  try {
    const [data] = await db.query("SELECT * FROM users");
    if (!data || data.length === 0) {
      return res.status(200).send({
        success: true,
        message: "No All Users found",
        data: data[0],
      });
    }
    res.status(200).send({
      success: true,
      message: "All Users",
      totalUsers: data.length,
      data: data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All Users",
      error: error.message,
    });
  }
};

// get single user by id
exports.getSingleUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(404).send({
        success: false,
        message: "User ID is required in params",
      });
    }

    const [data] = await db.query(`SELECT * FROM users WHERE id=? `, [userId]);
    if (!data || data.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No user found",
      });
    }
    res.status(200).send(data[0]);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in getting user",
      error: error.message,
    });
  }
};

// create user
exports.usersSignup = async (req, res) => {
  try {
    const { name, email, password, refercode, signupmethod } = req.body;

    if (!name || !email || !password || !refercode || !signupmethod) {
      return res.status(500).send({
        success: false,
        message: "Please provide all fields",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [data] = await db.query(
      `INSERT INTO users ( name, email, password, refercode, signupmethod ) VALUES (?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, refercode, signupmethod]
    );

    if (!data) {
      return res.status(404).send({
        success: false,
        message: "Error in INSERT QUERY",
      });
    }

    const [results] = await db.query(`SELECT * FROM users WHERE id=?`, [
      data.insertId,
    ]);
    const users = results[0];
    const token = generateUsersToken(users);

    res.status(200).send({
      success: true,
      message: "User created successfully",
      data: {
        user: users,
        token,
      },
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Create User API",
      error: error.message,
    });
  }
};

// users login
exports.usersLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({
        success: false,
        error: "Please provide your credentials",
      });
    }
    const [results] = await db.query(`SELECT * FROM users WHERE email=?`, [
      email,
    ]);
    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        error: "Email and Password is not correct",
      });
    }
    const users = results[0];
    const isMatch = await bcrypt.compare(password, users.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Email and Password is not correct",
      });
    }
    const token = generateUsersToken(users);
    const { password: pwd, ...usersWithoutPassword } = users;
    res.status(200).json({
      success: true,
      message: "Successfully logged in",
      data: {
        user: usersWithoutPassword,
        token,
      },
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "User Login Unseccess",
      error: error.message,
    });
  }
};

// get me User
exports.getMeUsers = async (req, res) => {
  try {
    const decodeduser = req?.decodedusers.email;
    const [data] = await db.query(`SELECT * FROM users WHERE email=?`, [
      decodeduser,
    ]);

    res.status(200).json(data[0]);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// delete user
exports.deleteUser = async (req, res) => {
  try {
    const userID = req.params.id;
    if (!userID) {
      return res.status(404).send({
        success: false,
        message: "User ID is reqiured in params",
      });
    }
    await db.query(`DELETE FROM users WHERE id=?`, [userID]);
    res.status(200).send({
      success: true,
      message: "User Deleted Successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Delete User",
      error: error.message,
    });
  }
};

// user password update
exports.updateUserPassword = async (req, res) => {
  try {
    const userID = req.params.id;
    if (!userID) {
      return res.status(404).send({
        success: false,
        message: "User ID is requied in params",
      });
    }
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return res.status(404).send({
        success: false,
        message: "Old Password and New Password is requied in body",
      });
    }

    const decodeduser = req?.decodedusers?.email;
    const [data] = await db.query(
      `SELECT password FROM users WHERE email=? AND id=?`,
      [decodeduser, userID]
    );

    const checkPassword = data[0]?.password;

    if (!checkPassword) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(old_password, checkPassword);

    if (!isMatch) {
      return res.status(403).json({
        success: false,
        error: "Your Old Password is not correct",
      });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    const [result] = await db.query(`UPDATE users SET password=? WHERE id =?`, [
      hashedPassword,
      userID,
    ]);

    if (!result) {
      return res.status(403).json({
        success: false,
        error: "Something went wrong",
      });
    }

    res.status(200).send({
      success: true,
      message: "User password updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in password Update User",
      error: error.message,
    });
  }
};

// update user
exports.updateUser = async (req, res) => {
  try {
    const userID = req.params.id;
    if (!userID) {
      return res.status(404).send({
        success: false,
        message: "User ID is requied in params",
      });
    }
    const { name, phone } = req.body;
    if (!name || !phone) {
      return res.status(404).send({
        success: false,
        message: "Name and phone is requied in body",
      });
    }

    const [imagesData] = await db.query(
      `SELECT profile_image, nid_image FROM users WHERE id=? `,
      [userID]
    );
    const { profile_image, nid_image } = imagesData[0];
    const update_profile_image = req.files["profile_image"]
      ? req.files["profile_image"][0].path
      : profile_image;
    const update_nid_image = req.files["nid_image"]
      ? req.files["nid_image"][0].path
      : nid_image;
    const data = await db.query(
      `UPDATE users SET name=?, phone=?, profile_image=?, nid_image=?  WHERE id =?`,
      [name, phone, update_profile_image, update_nid_image, userID]
    );
    if (!data) {
      return res.status(500).send({
        success: false,
        message: "Error in update User ",
      });
    }
    res.status(200).send({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Update User ",
      error: error.message,
    });
  }
};
