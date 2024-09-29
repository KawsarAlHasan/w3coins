const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const mySqlPool = require("./config/db");
const path = require("path");
const app = express();
dotenv.config();

const globalCorsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};
app.use(cors(globalCorsOptions));
app.options("*", cors(globalCorsOptions));
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// ssh root@82.112.238.74
// W3CoinHosting@2024

// mysql -u root -p
// w3@passWord

// CREATE USER 'w3kawsar'@'%' IDENTIFIED BY 'w3Kawsar@';
// GRANT ALL PRIVILEGES ON *.* TO 'w3kawsar'@'%' WITH GRANT OPTION;
// FLUSH PRIVILEGES;

app.use("/public", express.static(path.join(__dirname, "public")));

app.use("/api/v1/users", require("./routes/usersRoute"));
app.use("/api/v1/admin", require("./routes/adminRoute"));
app.use("/api/v1/wallet", require("./routes/walletRoute"));
app.use("/api/v1/dashboard", require("./routes/dashbordRoute"));
app.use("/api/v1/bonus", require("./routes/bonusRoute"));
app.use("/api/v1/helps", require("./routes/helpsRoute"));

const port = process.env.PORT || 5000;

mySqlPool
  .query("SELECT 1")
  .then(() => {
    console.log("MYSQL DB Connected");
  })
  .catch((error) => {
    console.log(error);
  });

app.listen(port, () => {
  console.log(`W3Coins Server is running on port ${port}`);
});

app.get("/", (req, res) => {
  res.status(200).send("W3Coins Server is working");
});

// 404 Not Found middleware
app.use("*", (req, res, next) => {
  res.status(404).json({
    error: "You have hit the wrong route",
  });
});
