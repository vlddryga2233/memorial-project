const express = require('express');
const router = express.Router();
const admin = require('../middleware/admin');
const User = require('../models/User');
const Memorial = require('../models/Memorial');
const bcrypt = require('bcryptjs');

// @route   GET api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', admin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/admin/users
// @desc    Create a new user
// @access  Admin
router.post('/users', admin, async (req, res) => {
    try {
        const { name, email, password, isAdmin } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            name,
            email,
            password,
            isAdmin: isAdmin || false
        });

        await user.save();
        res.json({ msg: 'User created successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/admin/users/:id
// @desc    Delete a user
// @access  Admin
router.delete('/users/:id', admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        await User.deleteOne({ _id: req.params.id });
        res.json({ msg: 'User removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/admin/memorials
// @desc    Get all memorials
// @access  Admin
router.get('/memorials', admin, async (req, res) => {
    try {
        const memorials = await Memorial.find()
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
        res.json(memorials);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/admin/memorials
// @desc    Create a memorial
// @access  Admin
router.post('/memorials', admin, async (req, res) => {
    try {
        const { name, birthDate, deathDate, biography, createdBy } = req.body;

        const newMemorial = new Memorial({
            name,
            birthDate,
            deathDate,
            biography,
            createdBy,
            isApproved: true
        });

        const memorial = await newMemorial.save();
        res.json(memorial);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/admin/memorials/:id
// @desc    Update a memorial
// @access  Admin
router.put('/memorials/:id', admin, async (req, res) => {
    try {
        const memorial = await Memorial.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.json(memorial);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/admin/memorials/:id
// @desc    Delete a memorial
// @access  Admin
router.delete('/memorials/:id', admin, async (req, res) => {
    try {
        const memorial = await Memorial.findById(req.params.id);
        if (!memorial) {
            return res.status(404).json({ msg: 'Memorial not found' });
        }

        await memorial.remove();
        res.json({ msg: 'Memorial removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/admin/memorials/:id/approve
// @desc    Approve a memorial
// @access  Admin
router.put('/memorials/:id/approve', admin, async (req, res) => {
    try {
        const memorial = await Memorial.findByIdAndUpdate(
            req.params.id,
            { $set: { isApproved: true } },
            { new: true }
        );
        res.json(memorial);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router; 