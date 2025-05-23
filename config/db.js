require('dotenv').config();
const mongoose = require("mongoose");

const connection = mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log(`Database Connected`);
  })
  .catch((err) => {
    console.log(`Database connection Error :`, err.message);
  });

module.exports = connection;
