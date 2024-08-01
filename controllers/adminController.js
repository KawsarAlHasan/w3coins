const db = require("../config/db");
const bcrypt = require("bcrypt");
const { generateAdminToken } = require("../config/adminToken");

// admin login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({
        success: false,
        error: "Please provide your credentials",
      });
    }
    const [results] = await db.query(`SELECT * FROM admin WHERE email=?`, [
      email,
    ]);
    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        error: "Email and Password is not correct",
      });
    }
    const admin = results[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Email and Password is not correct",
      });
    }
    const token = generateAdminToken(admin);
    const { password: pwd, ...adminWithoutPassword } = admin;
    res.status(200).json({
      success: true,
      message: "Successfully logged in",
      data: {
        admin: adminWithoutPassword,
        token,
      },
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Admin Login Unseccess",
      error: error.message,
    });
  }
};

// get me admin
exports.getMeAdmin = async (req, res) => {
  try {
    const decodadmin = req?.decodedadmin?.email;
    const [data] = await db.query(`SELECT * FROM admin WHERE email=?`, [
      decodadmin,
    ]);

    res.status(200).json(data[0]);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// admin update
exports.updateAdmin = async (req, res) => {
  try {
    const adminID = req.params.id;
    if (!adminID) {
      return res.status(404).send({
        success: false,
        message: "Admin ID is requied in params",
      });
    }

    const { name } = req.body;

    const [resultsData] = await db.query(
      `UPDATE admin SET name=? WHERE id =?`,
      [name, adminID]
    );

    if (!resultsData) {
      return res.status(403).json({
        success: false,
        error: "Something went wrong",
      });
    }

    res.status(200).send({
      success: true,
      message: "Admin updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Update Admin ",
      error,
    });
  }
};

// admin password update
exports.updateAdminPassword = async (req, res) => {
  try {
    const adminID = req.params.id;
    if (!adminID) {
      return res.status(404).send({
        success: false,
        message: "Admin ID is requied in params",
      });
    }
    const { old_password, new_password } = req.body;
    if (!old_password || !new_password) {
      return res.status(404).send({
        success: false,
        message: "Old Password and New Password is requied in body",
      });
    }
    const [data] = await db.query("SELECT password FROM admin WHERE id =?", [
      adminID,
    ]);
    const checkPassword = data[0]?.password;
    const isMatch = await bcrypt.compare(old_password, checkPassword);
    if (!isMatch) {
      return res.status(403).json({
        success: false,
        error: "Your Old Password is not correct",
      });
    }
    const hashedPassword = await bcrypt.hash(new_password, 10);
    const [result] = await db.query(`UPDATE admin SET password=? WHERE id =?`, [
      hashedPassword,
      adminID,
    ]);
    if (!result) {
      return res.status(403).json({
        success: false,
        error: "Something went wrong",
      });
    }
    res.status(200).send({
      success: true,
      message: "Admin password updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in password Update Admin ",
      error: error.message,
    });
  }
};
