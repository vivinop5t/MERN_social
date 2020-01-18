const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult, check } = require("express-validator");
const config = require("config");

const auth = require("../../middlewares/auth");
const User = require("../../models/user");

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (e) {
    console.log("error", e);
    res.status(500).send("server error");
  }
});

router.post(
  "/login",
  [
    check("password", "password  is Required").exists(),
    check("email", "email is Required").isEmail()
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) {
        res.status(400).json({ error: [{ msg: "Email Not registered" }] });
      }

      const isPasswordMatched = await bcrypt.compare(password, user.password);

      if (!isPasswordMatched) {
        res.status(400).json({ error: [{ msg: "Invalid Credentials" }] });
      }

      const payload = {
        user: {
          id: user.id
        }
      };
      console.log(payload);
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (e) {
      console.log("error", e);
      res.status(500).send("server error");
    }
  }
);

module.exports = router;
