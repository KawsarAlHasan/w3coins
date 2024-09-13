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

// // get My Wallet
// exports.getMyWallet = async (req, res) => {
//   try {
//     const decodeduserID = req.decodedUser.id;

//     const [data] = await db.query(
//       "SELECT w.id, w.user_id, u.name, u.email, u.account_status, u.kyc_status, w.w3coin FROM wallate w INNER JOIN users u ON w.user_id = u.id WHERE w.user_id=?",
//       [decodeduserID]
//     );
//     if (!data || data.length === 0) {
//       return res.status(400).send({
//         success: true,
//         message: "No Wallet found",
//       });
//     }

//     const [miningList] = await db.query(
//       `SELECT * FROM today_mining WHERE user_id = ?`,
//       [decodeduserID]
//     );

//     res.status(200).send({
//       data: data[0],
//       miningList,
//     });
//   } catch (error) {
//     res.status(500).send({
//       success: false,
//       message: "Error in getting Wallet",
//       error: error.message,
//     });
//   }
// };

// // get today mining
// exports.getTodayMining = async (req, res) => {
//   try {
//     const decodeduserID = req.decodedUser.id;

//     const today = new Date();
//     const isoString = today.toISOString();
//     const date = isoString.slice(0, 10);

//     const [data] = await db.query(
//       `SELECT * FROM today_mining WHERE user_id = ? AND date=?`,
//       [decodeduserID, date]
//     );

//     if (!data || data.length === 0) {
//       return res.status(400).send({
//         success: false,
//         message: "Your today mining is null",
//       });
//     }

//     res.status(200).send({
//       success: true,
//       message: "Get today mining successfully",
//       data: data[0],
//     });
//   } catch (error) {
//     res.status(500).send({
//       success: false,
//       message: "Error in get today mining",
//       error: error.message,
//     });
//   }
// };

// // update Wallet
// exports.miningWallet = async (req, res) => {
//   try {
//     const decodeduserID = req.decodedUser.id;

//     const [data] = await db.query(`SELECT * FROM wallate WHERE user_id=?`, [
//       decodeduserID,
//     ]);
//     if (!data || data.length === 0) {
//       return res.status(400).send({
//         success: false,
//         message: "Your wallet is null",
//       });
//     }
//     const preCoin = data[0].w3coin;

//     const { w3coin, total_minite } = req.body;
//     if (!w3coin || !total_minite) {
//       return res.status(500).send({
//         success: false,
//         message: "W3Coins & total_minite are required in the body",
//       });
//     }

//     const totalW3Coin = preCoin + parseFloat(w3coin);

//     const [updateData] = await db.query(
//       `UPDATE wallate SET w3coin=? WHERE user_id=?`,
//       [totalW3Coin, decodeduserID]
//     );
//     if (!updateData) {
//       return res.status(500).send({
//         success: false,
//         message: "Error in updating w3coin",
//       });
//     }

//     const today = new Date();
//     const isoString = today.toISOString();
//     const date = isoString.slice(0, 10);

//     // Check if today's mining data already exists
//     const [existingMiningData] = await db.query(
//       `SELECT * FROM today_mining WHERE user_id=? AND date=?`,
//       [decodeduserID, date]
//     );

//     if (existingMiningData && existingMiningData.length > 0) {
//       // If data exists for today, update the existing record
//       const newW3Coin =
//         parseFloat(existingMiningData[0].w3coin) + parseFloat(w3coin);
//       const newTotalMinite =
//         parseFloat(existingMiningData[0].total_minite) +
//         parseFloat(total_minite);

//       const [updateMiningData] = await db.query(
//         `UPDATE today_mining SET w3coin=?, total_minite=? WHERE user_id=? AND date=?`,
//         [newW3Coin, newTotalMinite, decodeduserID, date]
//       );

//       if (!updateMiningData) {
//         return res.status(500).send({
//           success: false,
//           message: "Error in updating today's mining data",
//         });
//       }
//     } else {
//       // If no data exists for today, insert a new record
//       const [todayMaining] = await db.query(
//         `INSERT INTO today_mining (user_id, w3coin, date, total_minite) VALUES (?, ?, ?, ?)`,
//         [decodeduserID, w3coin, date, total_minite]
//       );

//       if (!todayMaining) {
//         return res.status(500).send({
//           success: false,
//           message: "Error in inserting today's mining data",
//         });
//       }
//     }

//     res.status(200).send({
//       success: true,
//       message: "W3Coin updated successfully",
//     });
//   } catch (error) {
//     res.status(500).send({
//       success: false,
//       message: "Error in updating W3Coin",
//       error: error.message,
//     });
//   }
// };

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
