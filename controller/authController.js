const GoogleStrategy = require("passport-google-oauth20");
const passport = require("passport");
  const SendEmail = require("./../utils/sendEmail");

const asyncHandler = require("express-async-handler");
const User = require("./../models/userModel");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const createToken = (userId, role) => {
  return JWT.sign({ userID: userId, role: role }, process.env.JWT_Secret_Key, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};
//signUp controller
exports.SignUp = asyncHandler(async (req, res, next) => {
  const { userName, email, password } = req.body;
  if (!userName || !email || !password) {
    return res.status(404).json({
      message: "please enter username and email and password ",
    });
  }
  const newuser = await User.create({
    userName,
    email,
    password,
    phone: req.body.phone,
  });
  const token = createToken(newuser._id, newuser.role);
  
  const activationToken = crypto.randomBytes(32).toString("hex");
  newuser.activationToken = crypto
    .createHash("sha256")
    .update(activationToken)
    .digest("hex");
  newuser.activationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours expiry

  await newuser.save({ validateBeforeSave: false });

  const activationURL = `http://localhost:4001/api/v1/auth/activate/${activationToken}`;

  const message = `Hi ${newuser.userName},\nClick the link to activate your account:\n${activationURL}`;

  await SendEmail({
    email: newuser.email,
    subject: "Activate your account",
    message,
  });
  console.log(token);
  res.status(200).json({
    Data: newuser,
    token,
  });
});
// login controller

exports.Login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new Error("Something went wrong", 404));
  }
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return res.status(401).json({
      message: "incorrect email or password",
    });
  }
  if (user.active === false) {
    return res.status(401).json({
      message: "please check your email and activate and login again",
    });
  }
  const token = createToken(user._id, user.role);

  
  res.status(200).json({
    message: "Login succssfuly",
    token,
  });
});

exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return res.status(401).json({
      message: "You are not login, please login to get access this route ",
    });
  }
  const decoded = JWT.verify(token, process.env.JWT_Secret_Key);
  const currentuser = await User.findById(decoded.userID);
  if (!currentuser) {
    return res.status(401).json({
      message: "please signup and access this route",
    });
  }
  if (currentuser.passwordChangedAt) {
    const passChangedTimeStamp = parseInt(
      currentuser.passwordChangedAt.getTime() / 1000,
      10
    );

    if (passChangedTimeStamp > decoded.iat)
      return res.status(401).json({
        message: "User Recently changed his password,please login again..",
      });
  }
  req.user = currentuser;
  next();
});
exports.allowedTo = (...roles) => {
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Your are not allowed to access this route",
      });
    }
  });
};
////passport to login with google

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.YOUR_GOOGLE_CLIENT_ID,
      clientSecret: process.env.YOUR_GOOGLE_CLIENT_SECRET,
      callbackURL:'https://real-estate-platform-production-6a5f.up.railway.app/api/v1/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      const user = await User.findOne({ email: profile.emails[0].value });

      if (user) {
        return done(null, user);
      }

      const newUser = await User.create({
        userName: profile.displayName,
        email: profile.emails[0].value,
        provider: "google",
        active:true
      });
      await newUser.save();
      return done(null, newUser);
    }
  )
);

// Serialize and Deserialize User for Session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
