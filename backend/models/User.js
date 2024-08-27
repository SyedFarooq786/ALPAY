// backend/models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true ,unique: true},
  callingCode: { type: String, required: true },
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String },
  currencyName: { type: String, required: true },
  currencySymbol: { type: String, required: true },
  profileImage: { type: String },
  upiID : { type: String},
  currencyCode : {type : String},
  email : {type : String,required: true},

});

const User = mongoose.model('User', userSchema);

module.exports = User;
