const User = require('./../models/userModel') ; 
const asyncHandler = require('express-async-handler') ; 

const crypto = require('crypto'); 
const JWT = require('jsonwebtoken');

exports.activateUser = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    activationToken: hashedToken,
    activationExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Activation token is invalid or expired" });
  }

  user.active = true;
  user.activationToken = undefined;
  user.activationExpires = undefined;

  await user.save({ validateBeforeSave: false });

const token = JWT.sign(
  { userID: user._id, role: user.role },
  process.env.JWT_Secret_Key,
  { expiresIn: process.env.JWT_EXPIRES_TIME }
);

  res.status(200).json({ message: "Account activated successfully"  , 
    token
  });
});
