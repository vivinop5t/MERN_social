const express = require("express");

const app = express();
const connectDb = require("./config/db");

app.get("/", (req, res) => res.send("API running"));

connectDb();
const PORT = process.env.port || 5000;

app.listen(PORT, () => {
  console.log(`Listening on Port ${PORT}`);
});
