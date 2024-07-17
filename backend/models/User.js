// backend/models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true },
  callingCode: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  currencyCode: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
