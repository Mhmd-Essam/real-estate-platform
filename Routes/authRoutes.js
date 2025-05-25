const express = require("express");
const router = express.Router();
const JWT = require("jsonwebtoken");
const validate = require("./../middleware/validationmiddleware");
const { SignUp, Login } = require("./../controller/authController");
const {
  forgetPassword,
  verifyPassResetCode,
  resepassword,
} = require("./../controller/cycleResetPassword");
const {
  authValidation,
  loginValidation,
} = require("./../validators/authValidators");
const { activateUser } = require("./../controller/cycleactivateemail");
const passport = require("passport");

router.route("/SignUp").post(validate(authValidation), SignUp);
router.route("/Login").post(validate(loginValidation), Login);
router.route("/forgotpassword").post(forgetPassword);
router.route("/verifyResetCode").post(verifyPassResetCode);
router.route("/resetPassword").put(resepassword);
router.route("/activate/:token").get(activateUser);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google Callback Route
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/", session: true }),
  (req, res) => {
    const token = JWT.sign(
      { userID: req.user._id, role: req.user.role },
      process.env.JWT_Secret_Key,
      { expiresIn: process.env.JWT_EXPIRES_TIME }
    );

    res.status(200).json({
      message: "Google login successful",
      token,
      user: req.user,
    });
  }
);

module.exports = router;
