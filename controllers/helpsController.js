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

    // Insert the bonus
    const [data] = await db.query(
      `INSERT INTO helps (name, email, message) VALUES (?, ?, ?)`,
      [name, email, message]
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
