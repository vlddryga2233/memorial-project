const mongoose = require('mongoose');
const config = require('config');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(config.get('mongoURI'))
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

async function makeAdmin(email) {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        user.isAdmin = true;
        await user.save();
        console.log(`User ${email} is now an admin`);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

// Get email from command line argument
const email = process.argv[2];
if (!email) {
    console.log('Please provide an email address');
    process.exit(1);
}

makeAdmin(email); 