const studentModel = require("../models/student");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { signUpTemplate } = require('../utils/mailTemplate');

exports.createStudent = async (req, res) => {
    try {
        const { teacherId } = req.params
       
        const { fullName, email, gender, stack, password }= req.body
        
        const student = await studentModel.findOne({ email: email.toLowerCase() })
        if (student) {
          return res.status(400).json({
            message: `student with email ${email} already exists`
         })
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
     
        const newStudent = new studentModel({
            teacherId,
            fullName,
            email,
            gender,
            stack,
            password: hashedPassword
        })

        const token = jwt.sign({ userId: student._id }, process.env.JWT_SECRET, { expiresIn: "1hour" });
       const link = `${req.protocol}://${req.get("host")}/api/v1/user-verify/${token}`;
   
       const firstName = student.fullName.split(" ")[0]
    
       const mailDetails = {
         email: student.email,
         subject: "Email verification",
         html: signUpTemplate(link, firstName)
        };
    
      await sendMail(mailDetails)

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

exports.verifyEmail = async (req, res) => {
  try {
       const { token } = req.params;
       if (!token) {
        return res.status(400).json({
        message: "Token not found"
        })
     }
     jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
      if (err) {
        if (err instanceof jwt.JsonWebTokenError) {
         const decodedToken = jwt.decode(token)
         const student = await studentModel.findById(decodedToken.userId)

         if (student === null) {
         res.status(404).json({
           message: "User not found"
          })
        };
        if (student.isVerified === true) {
          return res.status(400).json({
          message: "User has already been verified"
         })
        };
    
       const newToken = await jwt.sign({ userId: student._id }, process.env.JWT_SECRET, { expiresIn: "1hour" });
       const link = `${req.protocol}://${req.get("host")}/api/v1/user-verify/${newToken}`;
   
       const firstName = student.fullName.split(" ")[0]
    
       const mailDetails = {
         email: student.email,
         subject: "Email verification",
         html: signUpTemplate(link, firstName)
        };
    
      await sendMail(mailDetails)
    
      res.status(200).json({
       message: "Link expired, check your email for new verification link"
      });
      };
    
    } else {
      const student = await studentModel.findById(payload.userId);
        if (student === null) {
          return res.status(404).json({
            message: "student not found"
          })
        };
    
        if (student.isVerified === true) {
          return res.status(400).json({
            message: "student has already been verified"
          })
        };
    
        student.isVerified = true
         await student.save()
    
        res.status(200).json({
          message: "student verified successfully"
         })
    
        };
    
    })
    } catch (error) {
       console.error(error)
        res.status(500).json({
        message: "Error verifing student"
        })
    }
};    

exports.logIn = async (req,res) => {
    try {
        const { email, password } = req.body;
        
        const student = await studentModel.findOne({ email: email.toLowerCase() });
        if (!student) {
            return res.status(404).json({ message: "student not found" });
        }

        const isValidPassword = await bcrypt.compare(password, student.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: "Invalid password" });
        }
        const token = jwt.sign({userId: student._id},process.env.JWT_SECRET,{expiresIn: '20min'})
        
        res.status(200).json({ 
            message: 'Login Successfully',
            data:student,
            token 
        });
        
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Internal Server Error' + error.message
        })  
    }
};


exports.getStudentDetails = async (req, res) => {
    try {
      const { studentId } = req.user;
  
      const student = await studentModel.findById(studentId);

      if (!student) {
        return res.status(404).json({
          message: "Student not found",
        });
      }
      res.status(201).json({
        message: `All details for ${student.fullName}`,
        data: student,
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({
        message: "Internal server error",
      });
    }
};