const express = require('express');
const router = express.Router();
const CountryCode = require('../models/CountryCode');
const axios = require('axios');

// Endpoint to fetch country code based on calling code
router.get('/country-code/:callingCode', async (req, res) => {
  const { callingCode } = req.params;
  console.log(`Fetching country code for calling code: ${callingCode}`);

  try {
    // Log the query
    console.log('Query:', { callingCode });

    // Query the MongoDB collection
    const countryData = await CountryCode.findOne({ callingCode }).exec();

    if (!countryData) {
      console.log(`Country data with calling code ${callingCode} not found`);
      return res.status(404).json({ message: 'Country data not found' });
    }

    const { countryCode } = countryData;

    // Log the fetched country data
    console.log(`Fetched country data from MongoDB: ${JSON.stringify(countryData)}`);

    // Fetch country details from external API
    const apiUrl = `https://restcountries.com/v3.1/alpha/${countryCode}`;
    console.log(`Fetching country details from API: ${apiUrl}`);
    const response = await axios.get(apiUrl);
    const countryDetails = response.data[0];

    // Log the fetched country details from API
    //console.log(`Fetched country details from API: ${JSON.stringify(countryDetails)}`);

    // Extract currency details
    const currencyCode = Object.keys(countryDetails.currencies || {})[0] || 'N/A';
    const currencyDetails = countryDetails.currencies[currencyCode] || {};
    const currencyData = {
      currencyCode,
      currencyName: currencyDetails.name || 'N/A',
      currencySymbol: currencyDetails.symbol || 'N/A',
    };

    // Log the extracted currency details
    console.log(`Extracted currency data: ${JSON.stringify(currencyData)}`);

    // Send back the country and currency details
    res.json({
      countryCode: countryData.countryCode,
      currency: currencyData,
    });
  } catch (error) {
    console.error('Error fetching country data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
