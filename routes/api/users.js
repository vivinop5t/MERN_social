const express = require("express");
const router = express.Router();
const { validationResult, check } = require("express-validator");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");
const User = require("../../models/user");

router.post(
  "/",
  [
    check("name", "name is Required")
      .not()
      .notEmpty(),
    check("password", "name is Required").isLength({ min: 6 }),
    check("email", "email is Required").isEmail()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }
    const { name, email, password } = req.body;
    try {
      const isUserExist = await User.findOne({ email: email });
      if (isUserExist) {
        res.status(400).json({ error: [{ msg: "user already exists" }] });
      }
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm"
      });
      user = new User({
        name,
        email,
        password,
        avatar
      });
      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id
        }
      };

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
