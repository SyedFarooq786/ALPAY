const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Endpoint to check if user exists
router.get('/check-user-exists/:phoneNumber', async (req, res) => {
  const { phoneNumber } = req.params;
  try {
    const user = await User.findOne({ phoneNumber });
    if (user) {
      return res.json({ userExists: true });
    } else {
      return res.json({ userExists: false });
    }
  } catch (error) {
    console.error('Error checking user existence:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/save-user-details
router.post('/save-user-details', async (req, res) => {
  const { phoneNumber, callingCode, firstName, lastName, currencyCode } = req.body;

  try {
    // Create a new user instance
    const newUser = new User({
      phoneNumber,
      callingCode,
      firstName,
      lastName,
      currencyCode,
    });

    // Save the user to MongoDB
    await newUser.save();

    res.status(201).json(newUser); // Respond with the newly created user
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ error: 'Server error. Failed to save user.' });
  }
});

module.exports = router;