// models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    phoneNumber: { type: String, required: true },
    transactionNumber: { type: String, required: true },
    amount: { type: Number, required: true },
    senderCurrencySymbol: { type: String, required: true },
    senderCurrencyCode: { type: String, required: true },
    recipientName: { type: String, required: true },
    recipientUPI: { type: String, required: true },
    recipientCurrencySymbol: { type: String, required: true },
    recipientCurrencyCode: { type: String, required: true },
    transactionTime: { type: String, required: true },
    transactionType:{ type: String, required: true },
    transactionType:{ type: String, required: true },
    debitAmount :{ type: String, required: true },
    
  });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
