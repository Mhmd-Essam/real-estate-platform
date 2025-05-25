  const User = require("./../models/userModel");
  const asyncHandler = require("express-async-handler");
  const crypto = require("crypto");
  const SendEmail = require("./../utils/sendEmail");
  const JWT = require("jsonwebtoken");

  const createToken = (userId, role) => {
    return JWT.sign({ userID: userId, role: role }, process.env.JWT_Secret_Key, {
      expiresIn: process.env.JWT_EXPIRES_TIME,
    });
  };

  exports.forgetPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        message: "user not found check your email or go to signup",
      });
    }
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedResetCode = crypto
      .createHash("sha256")
      .update(resetCode)
      .digest("hex");
    user.passwordResetCode = hashedResetCode;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    user.passwordResetVerified = false;
    await user.save();

    const message = `Hi ${user.userName},\nWe received a request to reset the password on your RealState App Account.\n${resetCode}\nEnter your reset code`;
    try {
      await SendEmail({
        email: user.email,
        subject: "Your Password reset code (valid for 10min)",
        message,
      });
    } catch (err) {
      user.passwordResetCode = undefined;
      user.passwordResetExpires = undefined;
      user.passwordResetVerified = undefined;
      await user.save();
      return res
        .status(500)
        .json({ message: "Failed to send reset code. Try again later." });
    }

    res.status(200).json({
      status: "success",
      message: "Reset code send to email",
    });
  });

  exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
    const hashedResetCode = crypto
      .createHash("sha256")
      .update(req.body.resetCode)
      .digest("hex");

    const user = await User.findOne({
      passwordResetCode: hashedResetCode,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(401).json({
        message: "reset code invalid or expired",
      });
    }
    user.passwordResetVerified = true;
    await user.save();
    res.status(200).json({
      status: "success",
    });
  });

  exports.resepassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    const {NewPassword} = req.body;
    if (!user) {
      return res.status(404).json({
        message: `There is no user with this email ${req.body.email} `,
      });
    }
    if (!user.passwordResetVerified) {
      return res.status(401).json({
        message: "Reset Code Not Verified",
      });
    }

    user.password = NewPassword;
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();

    const token = createToken(user._id, user.role);
    res.status(200).json({
      message: "password changed successfuly",
      token,
    });
  });

  /// hamo i need 


