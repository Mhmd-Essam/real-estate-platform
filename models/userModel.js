const mongoose = require("mongoose");
const bcrypt = require('bcrypt')
const UserSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "username is required"],
      
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase:[true,'email is must a lowercase']
    },
    phone: {
      type: Number,
    },
  password: {
      type: String,
      required: function() {
        return this.provider !== 'google';
      },
      min: [8, "At least password is 8 characters"],
    },
    role: {
      type: String,
      enum: ["buyer", "seller", "agent", "admin"],
      default:"buyer"
    },
    image:{ 
        type:String , 
        default:'image.jpg'
    },
    active:{
        type:Boolean, 
        default:false
    },
    provider:String,
    passwordChangedAt: Date ,
    passwordResetCode:String,
    passwordResetExpires:Date,
    passwordResetVerified:Boolean, 
  },
  { timestamps: true }
);

UserSchema.pre('save',async function(next){ 
  this.password = await bcrypt.hash(this.password,12); 
  next();
})

module.exports = mongoose.model("User", UserSchema);
