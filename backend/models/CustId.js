// models/CustId.js
const mongoose = require('mongoose');

const custIdSchema = new mongoose.Schema({
  currentId: {
    type: String,
    required: true,
    unique: true
  }
});

const CustId = mongoose.model('CustId', custIdSchema);
module.exports = CustId;
