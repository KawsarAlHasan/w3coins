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

app.use("/public", express.static(path.join(__dirname, "public")));

app.use("/api/v1/users", require("./routes/usersRoute"));
app.use("/api/v1/admin", require("./routes/adminRoute"));
app.use("/api/v1/wallet", require("./routes/walletRoute"));

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
