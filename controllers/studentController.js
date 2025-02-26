const studentModel = require("../models/student");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.create = async (req, res) => {
    try {
        const { teacherId } = req.params
       
        const { fullName, email, gender, password }= res.body
        
        const user = await studentModel.findOne({ email: email.toLowerCase() })
        if (user) {
          return res.status(400).json({
            message: "Email already exists" })
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
     
        const student = new studentModel({
            teacherId,
            fullName,
            email,
            gender,
            password: hashedPassword
        })
      
        await student.save()
        res.status(201).json({
            message: "Student created successfully" })

    }catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Internal Server Error' + error.message
        })
    }
};