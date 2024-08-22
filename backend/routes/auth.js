const express = require('express');
const router = express.Router();
const User = require('../models/User');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const CustId = require('../models/CustId');

cloudinary.config({
  cloud_name: 'world-pay', 
  api_key: '894842369536471',   
  api_secret: 'ebhGoox7sAyJiJU6C9NWfxcMW6U'
});


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profile_images', // Cloudinary folder name
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const upload = multer({ storage: storage });

// Endpoint to check user details

router.get('/user/:phoneNumber', async (req, res) => {
  const { phoneNumber } = req.params;
  console.log(`Fetching user with phone number: ${phoneNumber}`);  // Log phone number
  try {
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      console.log(`User with phone number ${phoneNumber} not found`);
      return res.status(404).json({ message: 'User not found' });
    }
    console.log(`User found: ${JSON.stringify(user)}`);
    res.json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

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
  const { phoneNumber, callingCode, firstName, middleName, lastName, currencyName,currencySymbol,upiID,currencyCode} = req.body;

  try {
    // Create a new user instance
    const newUser = new User({
      phoneNumber,
      callingCode,
      firstName,
      middleName,
      lastName,
      currencyName,
      currencySymbol,
      upiID,
      currencyCode
    });

    // Save the user to MongoDB
    await newUser.save();

    res.status(201).json(newUser); // Respond with the newly created user
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ error: 'Server error. Failed to save user.' });
  }
});



// PUT /api/auth/user/:phoneNumber - Update user profile image
router.put('/user/:phoneNumber', upload.single('profileImage'), async (req, res) => {
  const { phoneNumber } = req.params;
  const profileImage = req.file ? req.file.path : req.body.profileImage;
  try {
    const user = await User.findOneAndUpdate(
      { phoneNumber },
      { profileImage },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error updating profile image:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/next-custid', async (req, res) => {
  try {
    let custIdDoc = await CustId.findOne();

    if (!custIdDoc) {
      // Create the initial custid if it doesn't exist
      custIdDoc = new CustId({ currentId: 'WPAY0000' });
      await custIdDoc.save();
    }

    // Increment the current ID
    const currentId = custIdDoc.currentId;
    const numericPart = parseInt(currentId.substring(4)) + 1;
    const newCustId = `WPAY${numericPart.toString().padStart(4, '0')}`;

    // Update the document with the new custid
    custIdDoc.currentId = newCustId;
    await custIdDoc.save();

    res.json({ custId: newCustId });
  } catch (error) {
    console.error('Error generating custid:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;