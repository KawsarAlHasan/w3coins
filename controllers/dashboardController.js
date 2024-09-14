const db = require("../config/db");

// get all Coins
exports.getTotalCoins = async (req, res) => {
  try {
    const [result] = await db.query(
      "SELECT COUNT(*) AS total_users FROM users"
    );
    const totalUsers = result[0].total_users;

    const [data] = await db.query("SELECT w3coin FROM wallate");

    if (!data || data.length === 0) {
      return res.status(200).send({
        success: true,
        message: "No All Coins found",
        data: data[0],
      });
    }

    const today = new Date();
    const isoString = today.toISOString();
    const date = isoString.slice(0, 10);

    const [todayData] = await db.query(
      "SELECT w3coin FROM today_mining WHERE date=?",
      [date]
    );

    let totalCoins = data.reduce((total, record) => total + record.w3coin, 0);
    let todayCoins = todayData.reduce(
      (total, record) => total + record.w3coin,
      0
    );

    const [coin_rate] = await db.query(`SELECT price FROM coin_rate`);

    res.status(200).send({
      success: true,
      message: "All Coins",
      totalCoins,
      totalUsers,
      coinPrice: coin_rate[0].price,
      todayCoins,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All Coins",
      error: error.message,
    });
  }
};

// get Coin Rate
exports.getCoinRate = async (req, res) => {
  try {
    const [data] = await db.query(`SELECT * FROM coin_rate`);

    res.status(200).send({
      success: true,
      message: "get Coin Price successfully",
      data: data[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in get Coin Price",
      error: error.message,
    });
  }
};

// update Coin Rate
exports.updateCoinRate = async (req, res) => {
  try {
    const { price } = req.body;
    if (!price) {
      return res.status(400).send({
        success: false,
        message: "price is required in the body",
      });
    }

    const [updateData] = await db.query(
      `UPDATE coin_rate SET price=? WHERE id=?`,
      [price, 1]
    );

    if (updateData.affectedRows > 0) {
      return res.status(200).send({
        success: true,
        message: "Coin Rate updated successfully",
      });
    } else {
      return res.status(404).send({
        success: false,
        message: "No rows were updated. User might not exist.",
      });
    }
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in updating Coin Rate",
      error: error.message,
    });
  }
};

// get new user bonus
exports.newUserBonusGet = async (req, res) => {
  try {
    const [data] = await db.query(
      `SELECT * FROM new_user_bonus WHERE name='new_user_bonus'`
    );

    res.status(200).send({
      success: true,
      message: "get new user bonus successfully",
      data: data[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in get new user bonus",
      error: error.message,
    });
  }
};

// update new user bonus
exports.newUserBonusUpdate = async (req, res) => {
  try {
    const { bonus } = req.body;
    if (!bonus) {
      return res.status(400).send({
        success: false,
        message: "bonus is required in the body",
      });
    }

    const [updateData] = await db.query(
      `UPDATE new_user_bonus SET bonus=? WHERE name='new_user_bonus'`,
      [bonus]
    );

    if (updateData.affectedRows > 0) {
      return res.status(200).send({
        success: true,
        message: "new user bonus updated successfully",
      });
    } else {
      return res.status(404).send({
        success: false,
        message: "No record found to update the bonus",
      });
    }
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in updating new user bonus",
      error: error.message,
    });
  }
};

// get referral_bonus
exports.getReferralBonus = async (req, res) => {
  try {
    const [data] = await db.query(
      `SELECT * FROM new_user_bonus WHERE name='referral_bonus'`
    );

    res.status(200).send({
      success: true,
      message: "get referral bonus successfully",
      data: data[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in get referral bonus",
      error: error.message,
    });
  }
};

// update referral_bonus
exports.updateReferralBonus = async (req, res) => {
  try {
    const { bonus } = req.body;
    if (!bonus) {
      return res.status(400).send({
        success: false,
        message: "bonus is required in the body",
      });
    }

    const [updateData] = await db.query(
      `UPDATE new_user_bonus SET bonus=? WHERE name='referral_bonus'`,
      [bonus]
    );

    if (updateData.affectedRows > 0) {
      return res.status(200).send({
        success: true,
        message: "referral bonus updated successfully",
      });
    } else {
      return res.status(404).send({
        success: false,
        message: "No record found to update the referral bonus",
      });
    }
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in updating referral bonus",
      error: error.message,
    });
  }
};
