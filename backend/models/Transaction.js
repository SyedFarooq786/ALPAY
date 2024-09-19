// models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true },  // Sender's phone number
  recipientPhoneNumber: { type: String, required: true },  // Recipient's phone number
  transactionNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  senderCurrencySymbol: { type: String, required: true },
  senderCurrencyCode: { type: String, required: true },
  recipientName: { type: String, required: true },
  recipientUPI: { type: String, required: true },
  recipientCurrencySymbol: { type: String, required: true },
  recipientCurrencyCode: { type: String, required: true },
  transactionTime: { type: String, required: true },
  transactionType: { type: String,enum: ['debit', 'credit'], required: true },
  debitAmount: { type: Number, required: true },
  creditAmount: { type: Number, required: true },
  senderName: { type: String, required: true },
  bankAccount: { type: String, required: true },
  debitedFrom: { type: String, required: true },
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
