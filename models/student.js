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
    stack: {
        type: String, 
        enum:['Backend','Frontend','Product Design'],
        require:true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    assignedTeacher: {
        type: mongoose.Schema.Types.ObjectId,
        require:true,
        ref: "Teachers"
    },

},{timestamps: true})

const studentModel = mongoose.model('Student', studentSchema);

module.exports = studentModel;
