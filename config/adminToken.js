const jwt = require("jsonwebtoken");
exports.generateAdminToken = (adminInfo) => {
  const payload = {
    email: adminInfo.email,
  };
  const adminToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
    expiresIn: "100 days",
  });

  return adminToken;
};
