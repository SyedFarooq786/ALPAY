// backend/models/CountryCode.js

const mongoose = require('mongoose');

const countrycodeSchema = new mongoose.Schema({
  callingCode: { type: String, required: true },
  countryCode: { type: String, required: true },
  Country: { type: String } 
});

const CountryCode = mongoose.model('CountryCode', countrycodeSchema);

module.exports = CountryCode;
