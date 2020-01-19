const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost/myapp", {
      useNewUrlParser: true,
      useCreateIndex: true
    });
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

module.exports = connectDB;
