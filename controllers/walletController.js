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

// get single Wallet by id
exports.getSingleWallet = async (req, res) => {
  try {
    const walletID = req.params.id;
    if (!walletID) {
      return res.status(404).send({
        success: false,
        message: "User ID is required in params",
      });
    }

    const [data] = await db.query(
      "SELECT w.id, w.user_id, u.name, u.email, u.account_status, u.kyc_status, w.w3coin FROM wallate w INNER JOIN users u ON w.user_id = u.id WHERE w.id=?",
      [walletID]
    );
    if (!data || data.length === 0) {
      return res.status(200).send({
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
exports.createWallet = async (req, res) => {
  try {
    const { w3coin } = req.body;

    if (!w3coin) {
      return res.status(500).send({
        success: false,
        message: "Please provide w3coin fields",
      });
    }

    const { id } = req.decodeduser;
    const [data] = await db.query(
      `INSERT INTO wallate ( w3coin, user_id ) VALUES ( ?, ? )`,
      [w3coin, id]
    );

    if (!data) {
      return res.status(404).send({
        success: false,
        message: "Error in INSERT QUERY",
      });
    }

    res.status(200).send({
      success: true,
      message: "w3coins created successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Create w3 coins API",
      error: error.message,
    });
  }
};

// update Wallet
exports.updateWallet = async (req, res) => {
  try {
    const walletID = req.params.id;
    if (!walletID) {
      return res.status(404).send({
        success: false,
        message: "Wallet ID is requied in params",
      });
    }
    const { w3coin } = req.body;
    if (!w3coin) {
      return res.status(500).send({
        success: false,
        message: "W3Coins is requied in body",
      });
    }

    const data = await db.query(`UPDATE wallate SET w3coin=?  WHERE id =?`, [
      w3coin,
      walletID,
    ]);
    if (!data) {
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
