const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require('cors');
const morgan = require("morgan");
const db = require("./config/db");
const session = require("express-session");
const passport = require("passport");
const authRoute = require("./Routes/authRoutes");
const { errorHandler, notfound } = require("./middleware/errorHundler");

app.use(express.json());

dotenv.config();

if (process.env.NODE_MODE === "development") {
  app.use(morgan("dev"));
  console.log(`mode:${process.env.NODE_MODE}`);
}
db.connection;

app.use(
  session({
    secret: "yourSecret",
    resave: false,
    saveUninitialized: false,
  })
);
const corsOptions = {
  origin: 'http://localhost:5173', 
  credentials: true               
};

app.use(cors(corsOptions));

// Passport
app.use(passport.initialize());
app.use(passport.session());
app.use("/api/v1/auth", authRoute);

//localhost:4001/api/v1/auth/SignUp

http: app.use(notfound);
app.use(errorHandler);

app.listen(process.env.PORT, (req) => {
  console.log(`✅ App is running at: http://localhost:${process.env.PORT} `);
});
