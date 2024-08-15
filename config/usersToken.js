const jwt = require("jsonwebtoken");
exports.generateUsersToken = (userInfo) => {
  const payload = {
    id: userInfo.id,
    email: userInfo.email,
  };
  const usersToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
    expiresIn: "100 days",
  });

  return usersToken;
};
