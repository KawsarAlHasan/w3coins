const db = require("../config/db");

// create bonus for admin
exports.createBonus = async (req, res) => {
  try {
    const { user_id, bonus_name, coin } = req.body;

    // Check input fields
    if (!user_id || !bonus_name || !coin) {
      return res.status(400).send({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const date = new Date();

    // Insert the bonus
    const [data] = await db.query(
      `INSERT INTO bonus (user_id, bonus_name, coin, date) VALUES (?, ?, ?, ?)`,
      [user_id, bonus_name, coin, date]
    );

    if (!data || !data.insertId) {
      return res.status(500).send({
        success: false,
        message: "Error in creating Bonus",
      });
    }

    // Return success message along with the Bonus data
    res.status(200).send({
      success: true,
      message: "Bonus created successfully",
    });
  } catch (error) {
    // Handle server error
    res.status(500).send({
      success: false,
      message: "Error in Create Bonus API",
      error: error.message,
    });
  }
};

// get my bonus list
exports.getMyBonusList = async (req, res) => {
  try {
    const user_Id = req.decodedUser.id;

    const [userData] = await db.query(
      `SELECT * FROM bonus WHERE user_id=? ORDER BY id DESC`,
      [user_Id]
    );

    if (!userData || userData.length == 0) {
      return res.status(400).send({
        success: false,
        message: "No Bonus Found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Get my bonus list successfully",
      totalReferrel: userData.length,
      data: userData,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in server for getting my bonus list",
      error: error.message,
    });
  }
};
