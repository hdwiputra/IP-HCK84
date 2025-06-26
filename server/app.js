if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const { generateContent } = require("./helpers/gemini");
const router = require("./routes");
const errorHandler = require("./middlewares/errorHandler");
const qs = require("qs");
const cors = require("cors");

app.set("query parser", (str) => qs.parse(str));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.use("/", router);

app.use(errorHandler);

module.exports = app;
