const mongoose = require('mongoose');

const MemorialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    birthDate: {
        type: Date,
        required: true
    },
    deathDate: {
        type: Date,
        required: true
    },
    biography: {
        type: String,
        required: true
    },
    photos: [{
        url: String,
        isMain: {
            type: Boolean,
            default: false
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    videos: [{
        url: String,
        caption: String,
        uploadDate: {
            type: Date,
            default: Date.now
        }
    }],
    memories: [{
        content: String,
        author: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    qrCode: {
        type: String
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    isHidden: {
        type: Boolean,
        default: false
    }
});

// Update the updatedAt timestamp before saving
MemorialSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Memorial', MemorialSchema); 