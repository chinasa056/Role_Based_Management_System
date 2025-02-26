const mongoose = require("mongoose");

const adminSChema = new mongoose.Schema({
    
    fullName: {
        type: String,
        require: true
    },

    email: {
        type: String,
        required: true,
        lowercase: true
    },

    password: {
        type: String,
        required: true
    },

    gender: {
        type: String,
        enum: ["Male", "Female"]
    },
    isVerified: {
        type: Boolean,
        default: false
    },

    isAdmin: {
        type: Boolean,
        default: true
    },


}, { timestamps: true })

const adminModel = mongoose.model("Admin", adminSChema);

module.exports = adminModel