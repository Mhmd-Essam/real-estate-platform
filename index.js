/*require('dotenv').config(); 
const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const session = require("express-session");
const passport = require("passport");
require("./controller/authController");

const authRoute = require("./Routes/authRoutes");
const { errorHandler, notfound } = require("./middleware/errorHundler");

// ✅ Connect to DB
connectDB(); 

app.use(express.json());

if (process.env.NODE_MODE === "development") {
  app.use(morgan("dev"));
  console.log(`mode:${process.env.NODE_MODE}`);
}

// ✅ CORS setup for local and deployed frontend

app.use(cors());

app.use(
  session({
    secret: "yourSecret", 
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1/auth",authRoute);

app.get('/',(req,res)=>{ 
  console.log('welcom to my app')
})

app.use(notfound);
app.use(errorHandler);

app.listen(process.env.PORT || 4001, () => {
  console.log(`✅ App is running at: http://localhost:${process.env.PORT || 4001}`);
});

module.exports=app;
*/
require('dotenv').config();
const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const session = require("express-session");
const passport = require("passport");
require("./controller/authController");
const authRoute = require("./Routes/authRoutes");
const { errorHandler, notfound } = require("./middleware/errorHundler");

// ✅ Connect to DB
connectDB();

// ✅ Middleware
app.use(express.json());

// Fix the typo: NODE_MODE should be NODE_ENV
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// ✅ CORS setup
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "yourSecret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ✅ Routes
app.use("/api/v1/auth", authRoute);

// ✅ Root route - MUST send a response
app.get('/', (req, res) => {
  console.log('Welcome to my app');
  res.json({
    message: 'Welcome to Real Estate API',
    status: 'active',
    timestamp: new Date().toISOString()
  });
});

// ✅ Error handling middleware
app.use(notfound);
app.use(errorHandler);

// ✅ Only listen in development (not on Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(process.env.PORT || 4001, () => {
    console.log(`✅ App is running at: http://localhost:${process.env.PORT || 4001}`);
  });
}

// ✅ Export for Vercel
module.exports = app;