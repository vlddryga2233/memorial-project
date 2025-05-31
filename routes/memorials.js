const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const QRCode = require('qrcode');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Memorial = require('../models/Memorial');
const fs = require('fs');

// Configure multer for photo uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/memorials';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype)) {
            cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
            return;
        }
        cb(null, true);
    }
});

// @route   GET api/memorials
// @desc    Get all approved and visible memorials
// @access  Public
router.get('/', async (req, res) => {
    try {
        const memorials = await Memorial.find({ 
            isApproved: true,
            isHidden: false 
        })
            .populate('createdBy', 'name email')
            .sort({ date: -1 });
        res.json(memorials);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/memorials/admin
// @desc    Get all memorials (including unapproved) for admin
// @access  Admin
router.get('/admin', admin, async (req, res) => {
    try {
        const memorials = await Memorial.find()
            .populate('createdBy', 'name email')
            .sort({ date: -1 });
        res.json(memorials);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/memorials/:id
// @desc    Get memorial by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        console.log('Fetching memorial with ID:', req.params.id); // Debug log
        const memorial = await Memorial.findById(req.params.id)
            .select('name biography birthDate deathDate photos createdAt updatedAt');
        
        if (!memorial) {
            console.log('Memorial not found with ID:', req.params.id); // Debug log
            return res.status(404).json({ msg: 'Memorial not found' });
        }

        console.log('Memorial found:', { id: memorial._id, name: memorial.name }); // Debug log
        res.json(memorial);
    } catch (err) {
        console.error('Error in GET /:id:', err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Memorial not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   POST api/memorials
// @desc    Create a memorial
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { name, biography, birthDate, deathDate } = req.body;

        const newMemorial = new Memorial({
            name,
            biography,
            birthDate,
            deathDate,
            createdBy: req.user.id
        });

        const memorial = await newMemorial.save();
        
        // Generate QR code
        const qrCode = await QRCode.toDataURL(`${process.env.CLIENT_URL}/memorial/${memorial._id}`);
        memorial.qrCode = qrCode;
        await memorial.save();

        res.json(memorial);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/memorials/:id/photos
// @desc    Upload a photo for a memorial
// @access  Private
router.post('/:id/photos', [auth, upload.single('photo')], async (req, res) => {
    try {
        const memorial = await Memorial.findById(req.params.id);
        if (!memorial) {
            return res.status(404).json({ msg: 'Memorial not found' });
        }

        // Check if user is the creator or an admin
        if (memorial.createdBy.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        if (!req.file) {
            return res.status(400).json({ msg: 'No photo uploaded' });
        }

        const photoUrl = `/uploads/memorials/${req.file.filename}`;
        
        // If this is the first photo, set it as main
        const isMain = memorial.photos.length === 0;

        memorial.photos.push({
            url: photoUrl,
            isMain
        });

        await memorial.save();
        res.json(memorial);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/memorials/:id/photos/:photoId/main
// @desc    Set a photo as main
// @access  Private
router.put('/:id/photos/:photoId/main', auth, async (req, res) => {
    try {
        const memorial = await Memorial.findById(req.params.id);
        if (!memorial) {
            return res.status(404).json({ msg: 'Memorial not found' });
        }

        // Check if user is the creator or an admin
        if (memorial.createdBy.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        // Reset all photos to not main
        memorial.photos.forEach(photo => {
            photo.isMain = false;
        });

        // Set the selected photo as main
        const photo = memorial.photos.id(req.params.photoId);
        if (!photo) {
            return res.status(404).json({ msg: 'Photo not found' });
        }
        photo.isMain = true;

        await memorial.save();
        res.json(memorial);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/memorials/:id/photos/:photoId
// @desc    Delete a photo
// @access  Private
router.delete('/:id/photos/:photoId', auth, async (req, res) => {
    try {
        const memorial = await Memorial.findById(req.params.id);
        if (!memorial) {
            return res.status(404).json({ msg: 'Memorial not found' });
        }

        // Check if user is the creator or an admin
        if (memorial.createdBy.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const photo = memorial.photos.id(req.params.photoId);
        if (!photo) {
            return res.status(404).json({ msg: 'Photo not found' });
        }

        // Delete the file from the filesystem
        const filePath = path.join(__dirname, '..', photo.url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Remove the photo from the memorial
        memorial.photos.pull(req.params.photoId);

        // If the deleted photo was main and there are other photos, set the first one as main
        if (photo.isMain && memorial.photos.length > 0) {
            memorial.photos[0].isMain = true;
        }

        await memorial.save();
        res.json(memorial);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/memorials/:id
// @desc    Update a memorial
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        const { name, biography, birthDate, deathDate } = req.body;

        let memorial = await Memorial.findById(req.params.id);
        if (!memorial) {
            return res.status(404).json({ msg: 'Memorial not found' });
        }

        // Check if user is the creator or an admin
        if (memorial.createdBy.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        memorial = await Memorial.findByIdAndUpdate(
            req.params.id,
            { 
                name, 
                biography, 
                birthDate, 
                deathDate,
                updatedAt: Date.now()
            },
            { new: true }
        );

        res.json(memorial);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/memorials/:id
// @desc    Delete a memorial
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const memorial = await Memorial.findById(req.params.id);
        if (!memorial) {
            return res.status(404).json({ msg: 'Memorial not found' });
        }

        // Check if user is the creator or an admin
        if (memorial.createdBy.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        // Delete all photos from filesystem
        memorial.photos.forEach(photo => {
            const filePath = path.join(__dirname, '..', photo.url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        await memorial.remove();
        res.json({ msg: 'Memorial removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/memorials/:id/videos
// @desc    Add a video to memorial
// @access  Private (Creator only)
router.post('/:id/videos', [auth, upload.single('video')], async (req, res) => {
    try {
        const memorial = await Memorial.findById(req.params.id);
        if (!memorial) {
            return res.status(404).json({ msg: 'Memorial not found' });
        }

        // Check if user is the creator
        if (memorial.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const newVideo = {
            url: '/uploads/' + req.file.filename,
            caption: req.body.caption || '',
        };

        memorial.videos.unshift(newVideo);
        await memorial.save();
        res.json(memorial);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/memorials/:id/memories
// @desc    Add a memory to memorial
// @access  Public
router.post('/:id/memories', async (req, res) => {
    try {
        const memorial = await Memorial.findById(req.params.id);
        if (!memorial) {
            return res.status(404).json({ msg: 'Memorial not found' });
        }

        const newMemory = {
            content: req.body.content,
            author: req.body.author,
            date: Date.now(),
        };

        memorial.memories.unshift(newMemory);
        await memorial.save();
        res.json(memorial);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/memorials/:id/toggle-visibility
// @desc    Toggle memorial visibility
// @access  Admin
router.put('/:id/toggle-visibility', admin, async (req, res) => {
    try {
        const memorial = await Memorial.findById(req.params.id);
        if (!memorial) {
            return res.status(404).json({ msg: 'Memorial not found' });
        }

        memorial.isHidden = !memorial.isHidden;
        await memorial.save();

        // Populate the createdBy field before sending the response
        const populatedMemorial = await Memorial.findById(memorial._id)
            .populate('createdBy', 'name email');

        res.json(populatedMemorial);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/memorials/user/:userId
// @desc    Get memorials by user ID
// @access  Private
router.get('/user/:userId', auth, async (req, res) => {
    try {
        const memorials = await Memorial.find({ createdBy: req.params.userId })
            .populate('createdBy', 'name email')
            .sort({ date: -1 });
        res.json(memorials);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router; 