const mongoose = require('mongoose');

const organization = { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' };

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    accept: {
        type: Boolean,
        default: false
    },
    organization
});

const User = mongoose.model('User', UserSchema);

module.exports = { User };