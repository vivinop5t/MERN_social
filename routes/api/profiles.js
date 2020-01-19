const express = require("express");
const router = express.Router();
const { validationResult, check } = require("express-validator");

const Profile = require("../../models/profiles");
const auth = require("../../middlewares/auth");

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      return res.status(400).json({ msg: "Profile Not found" });
    }

    res.json({ profile });
  } catch (e) {
    console.log("error in me api", e);
    res.status(400).send("server error");
  }
});

// @route   POST api/profile
// @desc    Create or edit user profile
// @access  Private
router.post("/", auth, (req, res) => {
  //const { errors, isValid } = validateProfileInput(req.body);
  const errors = "";
  const isValid = true;
  // Check Validation
  if (!isValid) {
    // Return any errors with 400 status
    return res.status(400).json(errors);
  }

  // Get fields
  const profileFields = {};
  profileFields.user = req.user.id;
  //if (req.body.handle) profileFields.handle = req.body.handle;
  if (req.body.company) profileFields.company = req.body.company;
  if (req.body.website) profileFields.website = req.body.website;
  if (req.body.location) profileFields.location = req.body.location;
  if (req.body.bio) profileFields.bio = req.body.bio;
  if (req.body.status) profileFields.status = req.body.status;
  if (req.body.githubusername)
    profileFields.githubusername = req.body.githubusername;
  // Skills - Spilt into array
  if (typeof req.body.skills !== "undefined") {
    profileFields.skills = req.body.skills.split(",");
  }

  // Social
  profileFields.social = {};
  if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
  if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
  if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
  if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
  if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

  Profile.findOne({ user: req.user.id }).then(profile => {
    if (profile) {
      // Update
      Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      ).then(profile => res.json(profile));
    } else {
      // Create
      new Profile(profileFields).save().then(profile => res.json(profile));
      // Check if handle exists
      /*       Profile.findOne({ handle: profileFields.handle }).then(profile => {
        if (profile) {
          errors.handle = "That handle already exists";
          res.status(400).json(errors);
        }

        // Save Profile
        new Profile(profileFields).save().then(profile => res.json(profile));
      }); */
    }
  });
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public

router.get("/user/:user_id", (req, res) => {
  const errors = {};

  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      }

      res.json(profile);
    })
    .catch(err =>
      res.status(404).json({ profile: "There is no profile for this user" })
    );
});

router.post(
  "/experience",
  [
    auth,
    [
      check("title", "Title is not required")
        .not()
        .isEmpty(),
      check("company", "company is not required")
        .not()
        .isEmpty(),
      check("from", "from is not required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.send(400).json({ err: errors.array() });
      }
      const {
        title,
        company,
        from,
        to,
        current,
        description,
        location
      } = req.body;
      const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
      };
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      await profile.save();
      res.json(profile);
    } catch (e) {
      res.status(400).send("server error");
    }
  }
);

router.put("/experience/:experience_id", auth, async (req, res) => {
  const experience_id = req.params.user_id;
  const errors = {};
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      errors.noprofile = "There is no profile for this user";
      res.status(404).json(errors);
    }
    const experienceIndex = profile.experience.filter(
      item => item.id === experience_id
    );

    // Splice out of array
    profile.experience.splice(experienceIndex, 1);
    profile.experience = {
      experience: req.body.experience,
      from: req.body.from,
      to: req.body.to,
      location: req.body.location,
      title: req.body.title,
      company: req.body.company
    };
    await profile.save();

    res.json(profile);
  } catch (e) {
    console.log("e", e);
    res.status(400).send("server error");
  }
});

router.delete("/experience/:experience_id", auth, async (req, res) => {
  const experience_id = req.params.user_id;
  const errors = {};
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      errors.noprofile = "There is no profile for this user";
      res.status(404).json(errors);
    }
    const removeIndex = profile.experience
      .map(item => item.id)
      .indexOf(experience_id);

    // Splice out of array
    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (e) {
    console.log("e", e);
    res.status(400).send("server error");
  }
});

module.exports = router;
