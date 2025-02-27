const mongoose = require('mongoose');
 
const teacherSchema= new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowecase: true
    },
    password: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female'],
        required: true
    },
    stack: {
        type: String,
        enum: ['Frontend', 'Backend', 'ProductDesign'],
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    studentsId: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Teachers"
    }],
}, {timestamps: true});

const teacherModel= mongoose.model('Teachers', teacherSchema);

module.exports = teacherModel;