const express = require("express");
const cors = require("cors");
const logger = require("morgan");

const api = require("./routes/api");

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(logger("combined"));
app.use(express.json());

app.use("/v1", api);

module.exports = app;
