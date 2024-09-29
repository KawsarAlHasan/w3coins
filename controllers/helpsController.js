const db = require("../config/db");

// create help requist
exports.createHelpsRequist = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Check input fields
    if (!name || !email || !message) {
      return res.status(400).send({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const user_Id = req.decodedUser.id;

    // Insert the bonus
    const [data] = await db.query(
      `INSERT INTO helps (user_id, name, email, message) VALUES (?, ?, ?, ?)`,
      [user_Id, name, email, message]
    );

    if (!data || !data.insertId) {
      return res.status(500).send({
        success: false,
        message: "Error in creating help requist",
      });
    }

    // Return success message along with the help requist data
    res.status(200).send({
      success: true,
      message: "help requist created successfully",
    });
  } catch (error) {
    // Handle server error
    res.status(500).send({
      success: false,
      message: "Error in Create help requist API",
      error: error.message,
    });
  }
};

// get my Helps list
exports.getMyHelpsList = async (req, res) => {
  try {
    const user_Id = req.decodedUser.id;

    const [helpsData] = await db.query(
      `SELECT * FROM helps WHERE user_id=? ORDER BY id DESC`,
      [user_Id]
    );

    if (!helpsData || helpsData.length == 0) {
      return res.status(400).send({
        success: false,
        message: "No data Found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Get my helps list successfully",
      totalReferrel: helpsData.length,
      data: helpsData,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in server for getting my helps list",
      error: error.message,
    });
  }
};
