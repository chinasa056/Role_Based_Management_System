const studentModel = require ('../models/student');
const teacherModel = require("../models/teacher")
const bcrypt = require ('bcrypt');
const sendEmail = require ('../middleware/nodemailer');
const jwt = require ('jsonwebtoken');
const { signUpTemplate } = require('../utils/mailTemplate');

exports.register =async (req, res) => {
    try {
          const { fullName, email, gender, password } =req.body;
          const teacherExists = await teacherModel.findOne({email: email.toLowerCase()});
          if (teacherExists ){
            return res.status(400).json ({
                message: `Teacher with Email : ${email} already exists`
            })

          };
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const teacher = new teacherModel({
                fullName,
                email,
                password: hashedPassword,
                gender,
            });
            
            const token = await jwt.sign({teacherId: teacher._id}, process.env.JWT_SECRET, {expiresIn: '1h'});

            const link = `${req.protocol}://${req.get('host')}/api/v1/user-verify/${token}`
            const firstName = teacher.fullName.split(' ')[1]
            const html = signUpTemplate(link, firstName)
            const mailOptions = {
                subject: 'Welcome Email',
                email:teacher.email,
                html
            };
            await sendEmail(mailOptions);

            teacher.isAdmin = true;

            await teacher.save();


            return res.status(201).json ({
                message: 'teacher created successfully',
                data: teacher,
                token
            })

    }catch (error) {
        console.log(error.message)
        
        res.status(500).json ({
            message:" Error Registring Teacher"
        })
    }
    
}


exports.verifyTeacher = async (req, res) => {
    try {
        const { token } = req.params;
        if (!token) {
            return res.status(400).json({
                message: "Token not found"
            })
        };
        jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
            if (err) {
                if (err instanceof jwt.JsonWebTokenError) {
                    const decodedToken = jwt.decode(token)
                    const teacher = await teacherModel.findById(decodedToken.teacherId)
                    if (teacher === null) {
                        res.status(404).json({
                            message: "Teacher not found"
                        })
                    };
                    if (teacher.isVerified === true) {
                        return res.status(400).json({
                            message: "Teacher has already been verified"
                        })
                    };

                    const newToken = await jwt.sign({ teacherId: teacher._id }, process.env.JWT_SECRET, { expiresIn: "1hour" });
                    const link = `${req.protocol}://${req.get("host")}/api/v1/user-verify/${newToken}`;
                    
                    const firstName = teacher.fullName.split(" ")[0]

                
                    const mailDetails = {
                        email: teacher.email,
                        subject: "Email verification",
                        html: html(link, firstName)
                    };

                    await sendEmail(mailDetails)

                    res.status(200).json({
                        message: "Link expired, check your email for new verification link"
                    });

                };
               
            } else {
                console.log(payload)
                const teacher = await teacherModel.findById(payload.teacherId);
                if (teacher === null) {
                    return res.status(404).json({
                        message: "Teacher not found"
                    })
                };

                if (teacher.isVerified === true) {
                    return res.status(400).json({
                        message: "Teacher has already been verified"
                    })
                };

                teacher.isVerified = true
                await teacher.save()

                res.status(200).json({
                    message: "Teacher verified successfully"
                })

            };

        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Error verifing teacher"
        })
    }
};

exports.login = async (req,res) => {
    try {
          const { email, password} = req.body;
          
          if(email === null) {
            return res.status(400).json({
                message: "Please enter your email address"
            })
          }

          if(password === null) {
            return res.status(400).json({
                message: "Please enter your password"
            })
        }
        
        const teacher =await teacherModel.findOne({ email: email.toLowerCase() });
        if (!teacher) {
            return res.status(400).json ({
                message: `teacher with email ${email} does not exist`
            })
        };

        const correctPassword = await bcrypt.compare(password, teacher.password)
        if(!correctPassword){
            return res.status(400).json({
                message: "Incorrect Password"
            })
        }
 
          if (teacher.isVerified  ===false) {
             return res.status(400).json ({
                 message: "teacher not verified, please check your email to verify"
             })
          };
 
          const token = await jwt.sign({ teacherId: teacherExists._id }, process.env.JWT_SECRET, {expiresIn: '1day'});
 
           res.status(200).json ({
             message: 'Login successful',
             data: teacher,
             token
         })
 
     }catch (error) {
         console.log(error.message)
         res.status(500).json ({
             message:" Error logging in teacher"
         })
     }
 }


exports.getStudentByTeacher = async (req, res) => {
    try {
       const { id } = req.params
       const teacher = await teacherModel.findById(id).populate('studentsId',[ "fullName", "email", "gender"]);
       if (!teacher) {
       return res.status(404).json({
        message: 'Teacher not found'
       })
  }
     res.status(200).json({
        message: 'Teacher found',
        data: teacher
     });

    }catch (error) {
        res.status(500).json({
            message: 'Internal Server Error:' +error.message
        })
    }
}

