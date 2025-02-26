const studentModel = require("../models/student");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.createStudent = async (req, res) => {
    try {
        const { teacherId } = req.params
       
        const { fullName, email, gender, password }= req.body
        
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

        student.IsStudent = true
      
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
         const user = await userModel.findById(decodedToken.userId)

         if (user === null) {
         res.status(404).json({
           message: "User not found"
          })
        };
        if (user.isVerified === true) {
          return res.status(400).json({
          message: "User has already been verified"
         })
        };
    
       const newToken = await jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1hour" });
       const link = `${req.protocol}://${req.get("host")}/api/v1/user-verify/${newToken}`;
   
       const firstName = user.fullName.split(" ")[0]
    
       const mailDetails = {
         email: user.email,
         subject: "Email verification",
         html: html(link, firstName)
        };
    
      await sendMail(mailDetails)
    
      res.status(200).json({
       message: "Link expired, check your email for new verification link"
      });
      };
    
    } else {
      const user = await userModel.findById(payload.userId);
        if (user === null) {
          return res.status(404).json({
            message: "User not found"
          })
        };
    
        if (user.isVerified === true) {
          return res.status(400).json({
            message: "USer has already been verified"
          })
        };
    
        user.isVerified = true
         await user.save()
    
        res.status(200).json({
          message: "User verified successfully"
         })
    
        };
    
    })
    } catch (error) {
       console.error(error)
        res.status(500).json({
        message: "Error verifing user"
        })
    }
};    
exports.logIn = async (req,res) => {
    try {
        const { email, password } = req.body;
        
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: "Invalid password" });
        }
        const token = await jwt.sign({userId: user._id},process.env.JWT_SECRET,{expiresIn: '20min'})
        
        res.status(200).json({ 
            message: 'Login Successfully',
            data:user,
            token 
        });
        
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Internal Server Error' + error.message
        })  
    }
};
exports.getOneStudent = async (req, res) => {
    try {
        const {studentId} = req.params.id;
        const student = await studentModel.findById(studentId);
        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }
        res.status(200).json({
            message: "Student found successfully",
            data: student
        })

    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Internal Server Error' + error.message
        })
    }
};
exports.getStudentDetails = async (req, res) => {
    try {
      const { userId } = req.user;
  
      const student = await studentModel.findById(userId);

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