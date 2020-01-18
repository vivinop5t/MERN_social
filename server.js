const express = require("express");

const app = express();
const connectDb = require("./config/db");

app.get("/", (req, res) => res.send("API running"));

connectDb();
const PORT = process.env.port || 5000;

// middleware
app.use(express.json({ extended: false }));

//Routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/posts", require("./routes/api/posts"));
app.use("/api/profiles", require("./routes/api/profiles"));
app.use("/api/auth", require("./routes/api/authentication"));

app.listen(PORT, () => {
  console.log(`Listening on Port ${PORT}`);
});
