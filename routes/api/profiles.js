const express = require("express");
const router = express.Router();

router.get("/", (req, res) => res.send("Profiles Routes"));

module.exports = router;
