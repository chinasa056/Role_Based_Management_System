const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    fullName: {
        type: String, 
        require:true
    },
    email: {
        type: String, 
        require:true,
        lowercase:true
    },
    password: {
        type: String, 
        require:true
    },
    gender: {
        type: String, 
        enum:['Male','Female'],
        require:true
    },
    isStudent: {
        type: Boolean, 
        require:true
    },
    IsVerified: {
        type: Boolean,
        default: false
    },
    teacherId: {
        type: String, 
        require:true,
        ref: "Teachers"
    },

},{timestamps: true})

const studentModel = mongoose.model('Student', studentSchema);

module.exports = studentModel;
