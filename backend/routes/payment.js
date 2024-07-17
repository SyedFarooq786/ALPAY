// backend/routes/payment.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/', async (req, res) => {
  const { amount, currency } = req.body;

  // Currency conversion logic
  const conversionRate = await axios.get(`https://api.exchangerate-api.com/v4/latest/${currency}`);
  const convertedAmount = amount * conversionRate.data.rates.USD;

  // Payment processing logic (mock)
  const paymentResponse = await axios.post('https://payment-gateway.com/api/pay', {
    amount: convertedAmount,
    currency: 'USD',
  });

  res.json(paymentResponse.data);
});

module.exports = router;
