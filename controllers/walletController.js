const db = require("../config/db");

// get all wallet
exports.getAllwallet = async (req, res) => {
  try {
    const [data] = await db.query(
      "SELECT w.id, w.user_id, u.name, u.email, u.account_status, u.kyc_status, w.w3coin FROM wallate w INNER JOIN users u ON w.user_id = u.id"
    );

    if (!data || data.length === 0) {
      return res.status(200).send({
        success: true,
        message: "No All wallet found",
        data: data[0],
      });
    }

    res.status(200).send({
      success: true,
      message: "All wallet",
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

// get My Wallet
exports.getMyWallet = async (req, res) => {
  try {
    const decodeduserID = req.decodedUser.id;

    const [data] = await db.query("SELECT * FROM wallate WHERE user_id=?", [
      decodeduserID,
    ]);
    if (!data || data.length === 0) {
      return res.status(400).send({
        success: true,
        message: "No Wallet found",
      });
    }
    res.status(200).send(data[0]);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in getting Wallet",
      error: error.message,
    });
  }
};

// create wallet
// exports.createWallet = async (req, res) => {
//   try {
//     const { w3coin } = req.body;

//     if (!w3coin) {
//       return res.status(500).send({
//         success: false,
//         message: "Please provide w3coin fields",
//       });
//     }

//     const { id } = req.decodedUser;
//     const [data] = await db.query(
//       `INSERT INTO wallate ( w3coin, user_id ) VALUES ( ?, ? )`,
//       [w3coin, id]
//     );

//     if (!data) {
//       return res.status(404).send({
//         success: false,
//         message: "Error in INSERT QUERY",
//       });
//     }

//     res.status(200).send({
//       success: true,
//       message: "w3coins created successfully",
//     });
//   } catch (error) {
//     res.status(500).send({
//       success: false,
//       message: "Error in Create w3 coins API",
//       error: error.message,
//     });
//   }
// };

// update Wallet
exports.miningWallet = async (req, res) => {
  try {
    const decodeduserID = req.decodedUser.id;

    const [data] = await db.query(`SELECT * FROM wallate WHERE user_id=? `, [
      decodeduserID,
    ]);
    if (!data || data.length === 0) {
      return res.status(400).send({
        success: false,
        message: "Your wallate null",
      });
    }
    const preCoin = data[0].w3coin;

    const { w3coin } = req.body;
    if (!w3coin) {
      return res.status(500).send({
        success: false,
        message: "W3Coins is requied in body",
      });
    }

    const totalW3Coin = preCoin + parseFloat(w3coin);

    const [updateData] = await db.query(
      `UPDATE wallate SET w3coin=?  WHERE user_id=?`,
      [w3coin, decodeduserID]
    );
    if (!updateData) {
      return res.status(500).send({
        success: false,
        message: "Error in update w3coin",
      });
    }
    res.status(200).send({
      success: true,
      message: "w3coin updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Update w3coin",
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
