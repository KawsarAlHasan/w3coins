const db = require("../config/db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { generateUsersToken } = require("../config/usersToken");

// get all Users
exports.getAllUsers = async (req, res) => {
  try {
    let { page, limit, name, email, id } = req.query;

    // Default pagination values
    page = parseInt(page) || 1; // Default page is 1
    limit = parseInt(limit) || 20; // Default limit is 20
    const offset = (page - 1) * limit; // Calculate offset for pagination

    // Initialize SQL query and parameters array
    let sqlQuery = "SELECT * FROM users WHERE 1=1"; // 1=1 makes appending conditions easier
    const queryParams = [];

    // Add filters for name, email, and id if provided
    if (name) {
      sqlQuery += " AND name LIKE ?";
      queryParams.push(`%${name}%`); // Using LIKE for partial match
    }

    if (email) {
      sqlQuery += " AND email LIKE ?";
      queryParams.push(`%${email}%`);
    }

    if (id) {
      sqlQuery += " AND id = ?";
      queryParams.push(id);
    }

    // Add pagination to the query
    sqlQuery += " LIMIT ? OFFSET ?";
    queryParams.push(limit, offset);

    // Execute the query with filters and pagination
    const [data] = await db.query(sqlQuery, queryParams);

    if (!data || data.length === 0) {
      return res.status(200).send({
        success: true,
        message: "No users found",
        data: [],
      });
    }

    // Get total count of users for pagination info (with the same filters)
    let countQuery = "SELECT COUNT(*) as count FROM users WHERE 1=1";
    const countParams = [];

    // Add the same filters for total count query
    if (name) {
      countQuery += " AND name LIKE ?";
      countParams.push(`%${name}%`);
    }

    if (email) {
      countQuery += " AND email LIKE ?";
      countParams.push(`%${email}%`);
    }

    if (id) {
      countQuery += " AND id = ?";
      countParams.push(id);
    }

    const [totalUsersCount] = await db.query(countQuery, countParams);
    const totalUsers = totalUsersCount[0].count;

    // Send response with users data and pagination info
    res.status(200).send({
      success: true,
      message: "All Users",
      totalUsers: totalUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      data: data,
    });
  } catch (error) {
    // Error handling
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

    // Check input fields
    if (!name || !email || !password || !signupmethod) {
      return res.status(400).send({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).send({
        success: false,
        message: "Invalid email format",
      });
    }

    // Password length check
    if (password.length < 6) {
      return res.status(400).send({
        success: false,
        message: "Password should be at least 6 characters long",
      });
    }

    // Hashing password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique refer code
    async function generateUniqueReferCode(length, batchSize = 5) {
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

      // Helper function to generate a single random code
      function generateRandomCode(length) {
        let result = "";
        for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * characters.length);
          result += characters[randomIndex];
        }
        return result;
      }

      let uniqueCode = null;

      while (!uniqueCode) {
        // Step 1: Generate a batch of random codes
        const codesBatch = [];
        for (let i = 0; i < batchSize; i++) {
          codesBatch.push(generateRandomCode(length));
        }

        // Step 2: Check these codes against the database
        const placeholders = codesBatch.map(() => "?").join(","); // Create placeholders (?, ?, ?, ?)
        const [existingCodes] = await db.query(
          `SELECT own_refercode FROM users WHERE own_refercode IN (${placeholders})`,
          codesBatch
        );

        // Step 3: Filter out codes that already exist in the database
        const existingCodeSet = new Set(
          existingCodes.map((row) => row.own_refercode)
        );

        // Step 4: Find the first code that doesn't exist in the database
        uniqueCode = codesBatch.find((code) => !existingCodeSet.has(code));
      }

      return uniqueCode;
    }

    // Generate unique refer code (if not provided)
    const ownReferCode = await generateUniqueReferCode(6);

    let usedReferCode = "";
    if (refercode) {
      usedReferCode = refercode;
    }
    // walletNumber
    const hash = crypto.createHash("sha256").update(email).digest("hex");
    const walletNumber = hash.substring(0, 32);

    // Insert the user
    const [data] = await db.query(
      `INSERT INTO users (name, email, password, walletNumber, own_refercode, refercode, signupmethod) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        hashedPassword,
        walletNumber,
        ownReferCode,
        usedReferCode,
        signupmethod,
      ]
    );

    if (!data || !data.insertId) {
      return res.status(500).send({
        success: false,
        message: "Error in creating user",
      });
    }

    // Fetch new user bonus
    const [newUserBonus] = await db.query(
      `SELECT * FROM new_user_bonus WHERE name='new_user_bonus'`
    );
    const w3coin = newUserBonus[0]?.bonus || 0;

    // Insert bonus into the wallet
    const [w3coinData] = await db.query(
      `INSERT INTO wallate (w3coin, user_id) VALUES (?, ?)`,
      [w3coin, data.insertId]
    );

    if (!w3coinData) {
      return res.status(500).send({
        success: false,
        message: "Error in creating wallet",
      });
    }

    // If refercode is provided, add 5 W3Coins to the referrer's wallet
    if (refercode) {
      const [referrer] = await db.query(
        `SELECT id FROM users WHERE own_refercode = ?`,
        [refercode]
      );
      if (referrer.length > 0) {
        const referrerId = referrer[0].id;

        const [reffalBonus] = await db.query(
          `SELECT * FROM new_user_bonus WHERE name='referral_bonus'`
        );

        const referW3coin = reffalBonus[0]?.bonus || 0;

        await db.query(
          `UPDATE wallate SET w3coin = w3coin + ? WHERE user_id = ?`,
          [referW3coin, referrerId]
        );
      }
    }

    // Fetch and return the new user's information
    const [results] = await db.query(`SELECT * FROM users WHERE id=?`, [
      data.insertId,
    ]);
    const user = results[0];

    // Generate JWT token
    const token = generateUsersToken(user);

    // Return success message along with the user data
    res.status(200).send({
      success: true,
      message: "User created successfully",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    // Handle server error
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
    const decodeduser = req.decodedUser;
    res.status(200).json(decodeduser);
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
    const checkPassword = req.decodedUser?.password;

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
    const userID = req.decodedUser.id;

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

    const [data] = await db.query(
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

// verify status
exports.verifyStatusUpdate = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(404).send({
        success: false,
        message: "User ID is required in params",
      });
    }

    const { verify_status } = req.body;
    if (!verify_status) {
      return res.status(404).send({
        success: false,
        message: "verify_status is requied in body",
      });
    }

    const [data] = await db.query(
      `UPDATE users SET verify_status=?  WHERE id =?`,
      [verify_status, userId]
    );
    if (!data) {
      return res.status(500).send({
        success: false,
        message: "Error in update verify_status ",
      });
    }
    res.status(200).send({
      success: true,
      message: "verify_status updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Update verify_status ",
      error: error.message,
    });
  }
};
