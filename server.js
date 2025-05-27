require('dotenv').config(); 
const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const db = require("./config/db");
const session = require("express-session");
const passport = require("passport");

require("./controller/authController");

const authRoute = require("./Routes/authRoutes");
const { errorHandler, notfound } = require("./middleware/errorHundler");

// ✅ Connect to DB
db.connection;

app.use(express.json());

if (process.env.NODE_MODE === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_MODE}`);
}

// ✅ CORS setup for local and deployed frontend
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://realstate-phi-seven.vercel.app"

  ],
  credentials: true,
};
app.use(cors(corsOptions));

app.use(
  session({
    secret: "yourSecret", 
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1/auth", authRoute);

app.use(notfound);
app.use(errorHandler);

app.listen(process.env.PORT || 4001, () => {
  console.log(`✅ App is running at: http://localhost:${process.env.PORT || 4001}`);
});
