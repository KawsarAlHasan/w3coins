const db = require("../config/db");

// get all wallet
exports.getAllwallet = async (req, res) => {
  try {
    // Query parameters for pagination (default values if not provided)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // SQL query with LIMIT and OFFSET for pagination
    const [data] = await db.query(
      "SELECT w.id, w.user_id, u.name, u.email, u.account_status, u.kyc_status, w.w3coin FROM wallate w INNER JOIN users u ON w.user_id = u.id LIMIT ? OFFSET ?",
      [limit, offset]
    );

    // Query to count the total number of wallets (without pagination)
    const [countResult] = await db.query(
      "SELECT COUNT(*) as totalWallets FROM wallate"
    );
    const totalWallets = countResult[0].totalWallets;

    if (!data || data.length === 0) {
      return res.status(200).send({
        success: true,
        message: "No All wallet found",
        data: [],
        totalWallets: 0, // Include totalWallets in the response even if no data is found
        currentPage: page,
        totalPages: 0,
      });
    }

    res.status(200).send({
      success: true,
      message: "All wallet",
      currentPage: page,
      totalWallets: totalWallets, // Now using the actual total count
      totalPages: Math.ceil(totalWallets / limit), // Calculate total pages
      limit: limit,
      data: data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All wallet",
      error: error.message,
    });
  }
};

// get all mining history
exports.getAllMiningHistory = async (req, res) => {
  try {
    const { startDate, endDate, date } = req.query;

    let query = "SELECT * FROM today_mining";
    let params = [];

    if (startDate && endDate) {
      // If startDate and endDate are provided
      query += " WHERE date BETWEEN ? AND ?";
      params.push(startDate, endDate);
    } else if (date) {
      // If only date is provided
      query += " WHERE date = ?";
      params.push(date);
    }

    const [data] = await db.query(query, params);

    if (!data || data.length === 0) {
      return res.status(400).send({
        success: false,
        message: "No mining history found",
        data: data,
      });
    }

    res.status(200).send({
      success: true,
      message: "Get mining history successfully",
      data: data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in getting mining history",
      error: error.message,
    });
  }
};

// get My Wallet
exports.getMyWallet = async (req, res) => {
  try {
    const decodeduserID = req.decodedUser.id;

    const [data] = await db.query(
      "SELECT w.id, w.user_id, u.name, u.email, u.account_status, u.kyc_status, w.w3coin FROM wallate w INNER JOIN users u ON w.user_id = u.id WHERE w.user_id=?",
      [decodeduserID]
    );
    if (!data || data.length === 0) {
      return res.status(400).send({
        success: true,
        message: "No Wallet found",
      });
    }

    const [miningList] = await db.query(
      `SELECT * FROM today_mining WHERE user_id = ?`,
      [decodeduserID]
    );

    res.status(200).send({
      data: data[0],
      miningList,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in getting Wallet",
      error: error.message,
    });
  }
};

// get today mining
exports.getTodayMining = async (req, res) => {
  try {
    const decodeduserID = req.decodedUser.id;

    const today = new Date();
    const isoString = today.toISOString();
    const date = isoString.slice(0, 10);

    const [data] = await db.query(
      `SELECT * FROM today_mining WHERE user_id = ? AND date=?`,
      [decodeduserID, date]
    );

    if (!data || data.length === 0) {
      return res.status(400).send({
        success: false,
        message: "Your today mining is null",
      });
    }

    res.status(200).send({
      success: true,
      message: "Get today mining successfully",
      data: data[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in get today mining",
      error: error.message,
    });
  }
};

// update Wallet
exports.miningWallet = async (req, res) => {
  try {
    const decodeduserID = req.decodedUser.id;

    const [data] = await db.query(`SELECT * FROM wallate WHERE user_id=?`, [
      decodeduserID,
    ]);
    if (!data || data.length === 0) {
      return res.status(400).send({
        success: false,
        message: "Your wallet is null",
      });
    }
    const preCoin = data[0].w3coin;

    const { w3coin, total_minite } = req.body;
    if (!w3coin || !total_minite) {
      return res.status(500).send({
        success: false,
        message: "W3Coins & total_minite are required in the body",
      });
    }

    const totalW3Coin = preCoin + parseFloat(w3coin);

    const [updateData] = await db.query(
      `UPDATE wallate SET w3coin=? WHERE user_id=?`,
      [totalW3Coin, decodeduserID]
    );
    if (!updateData) {
      return res.status(500).send({
        success: false,
        message: "Error in updating w3coin",
      });
    }

    const today = new Date();
    const isoString = today.toISOString();
    const date = isoString.slice(0, 10);

    // Check if today's mining data already exists
    const [existingMiningData] = await db.query(
      `SELECT * FROM today_mining WHERE user_id=? AND date=?`,
      [decodeduserID, date]
    );

    if (existingMiningData && existingMiningData.length > 0) {
      // If data exists for today, update the existing record
      const newW3Coin =
        parseFloat(existingMiningData[0].w3coin) + parseFloat(w3coin);
      const newTotalMinite =
        parseFloat(existingMiningData[0].total_minite) +
        parseFloat(total_minite);

      const [updateMiningData] = await db.query(
        `UPDATE today_mining SET w3coin=?, total_minite=? WHERE user_id=? AND date=?`,
        [newW3Coin, newTotalMinite, decodeduserID, date]
      );

      if (!updateMiningData) {
        return res.status(500).send({
          success: false,
          message: "Error in updating today's mining data",
        });
      }
    } else {
      // If no data exists for today, insert a new record
      const [todayMaining] = await db.query(
        `INSERT INTO today_mining (user_id, w3coin, date, total_minite) VALUES (?, ?, ?, ?)`,
        [decodeduserID, w3coin, date, total_minite]
      );

      if (!todayMaining) {
        return res.status(500).send({
          success: false,
          message: "Error in inserting today's mining data",
        });
      }
    }

    res.status(200).send({
      success: true,
      message: "W3Coin updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in updating W3Coin",
      error: error.message,
    });
  }
};

// delete Wallet
exports.deleteWallet = async (req, res) => {
  try {
    const walletID = req.params.id;
    if (!walletID) {
      return res.status(404).send({
        success: false,
        message: "Wallet ID is reqiured in params",
      });
    }
    await db.query(`DELETE FROM wallate WHERE id=?`, [walletID]);
    res.status(200).send({
      success: true,
      message: "Wallet Deleted Successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Delete Wallet",
      error: error.message,
    });
  }
};
