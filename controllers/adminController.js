const adminModel = require("../models/admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { signUpTemplate } = require("../utils/mailTemplate");
const { sendEmail } = require("../middleware/nodemailer");
const studentModel = require("../models/student");
const teacherModel = require("../models/teacher");

exports.registerAdmin = async (req, res) => {
    try {
        const { fullName, email, password, gender } = req.body;

        const user = await adminModel.findOne({ email: email.toLowerCase() });
        if (user) {
            return res.status(400).json({
                message: `user with email: ${email} already exists`,
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // create an instance of the new user
        const newAdmin = new adminModel({
            fullName,
            email,
            password: hashedPassword,
            gender,
        });

        // generate a token
        const token = jwt.sign(
            { userId: newAdmin._id },
            process.env.JWT_SECRET,
            { expiresIn: "1hour" }
        );

        const link = `${req.protocol}://${req.get(
            "host"
        )}/api/v1/admin_verify/${token}`;

        const firstName = newAdmin.fullName.split(" ")[0];

        const mailDetails = {
            subject: "Welcome Mail",
            email: newAdmin.email,
            html: signUpTemplate(link, firstName),
        };
        //  await nodemailer to send the email
        await sendEmail(mailDetails);

        newAdmin.isAdmin = true;

        await newAdmin.save();

        res.status(201).json({
            message: "New Admin Created",
            data: newAdmin,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

exports.verifyAdmin = async (req, res) => {
    try {
        // extract the token from the params
        const { token } = req.params;
        if (!token) {
            return res.status(400).json({
                message: "Token not found",
            });
        }
        // verify the token
        jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
            if (err) {
                if (err instanceof jwt.JsonWebTokenError) {
                    const decodedToken = jwt.decode(token);

                    const admin = await userModel.findById(decodedToken.userId);

                    if (admin === null) {
                        res.status(404).json({
                            message: "Admin not found",
                        });
                    }

                    // check if the admin is verified
                    if (admin.isVerified === true) {
                        return res.status(400).json({
                            message: "admin has already been verified",
                        });
                    }

                    // generate a new token
                    const newToken = jwt.sign(
                        { userId: admin._id },
                        process.env.JWT_SECRET,
                        { expiresIn: "1hour" }
                    );

                    const link = `${req.protocol}://${req.get(
                        "host"
                    )}/api/v1/user-verify/${newToken}`;
                    const firstName = user.fullName.split(" ")[0];

                    // pass the mail options into an object variable
                    const mailDetails = {
                        email: user.email,
                        subject: "Email verification",
                        html: html(link, firstName),
                    };

                    await sendEmail(mailDetails);

                    res.status(200).json({
                        message: "Link expired, check your email for new verification link",
                    });
                }
                // if there was no error
            } else {
                console.log(payload);
                // check for the user in the database using the token id
                const Admin = await userModel.findById(payload.userId);
                if (Admin === null) {
                    return res.status(404).json({
                        message: "Admin not found",
                    });
                }

                // check if the user has been verified
                if (Admin.isVerified === true) {
                    return res.status(400).json({
                        message: "Admin has already been verified",
                    });
                }

                Admin.isVerified = true;
                await user.save();

                res.status(200).json({
                    message: "User verified successfully",
                });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error verifing user",
        });
    }
};

exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email) {
            return res.status(404).json({
                message: "Please enter your email address",
            });
        }

        if (!password) {
            return res.status(404).json({
                message: "Please enter your password",
            });
        }

        const admin = await adminModel.findOne({ email: email.toLowerCase() });
        if (!admin) {
            return res.status(404).json({
                message: `user with email : ${email} does not exist`,
            });
        }

        const correctPassword = await bcrypt.compare(password, admin.password);
        if (!correctPassword) {
            return res.status(404).json({
                message: "Incorrect Password",
            });
        }

        if (admin.isVerified === false) {
            return res.status(404).json({
                message:
                    "You are not verified: please check your email to verify your account",
            });
        }

        const token = jwt.sign(
            { userId: admin._id, isSuperAdmin: admin.isSuperAdmin },
            process.env.JWT_SECRET,
            { expiresIn: "1hour" }
        );

        res.status(200).json({
            message: "Login successful",
            data: admin,
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error verifing user",
        });
    }
};

// - POST /teachers - Add a new teacher.
//   - POST /students - Add a new student.
//   - GET /teachers - View all teachers.
//   - GET /students - View all students.
//   - PUT /teachers/:id - Update teacher details.
//   - PUT /students/:id - Update student details.
//   - DELETE /teachers/:id - Delete a teacher.
//   - DELETE /students/:id - Delete a student.


exports.getAllTeachers = async (req, res) => {
    try {

        const teachers = await teacherModel.find()

        res.status(200).json({
            message: "All teachers in the database",
            data: teachers
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error verifing user",
        });
    }
};

exports.getAllStudents = async (req, res) => {
    try {

        const students = await studentModel.find()

        res.status(200).json({
            message: "All students in the database",
            data: students
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error verifing user",
        });
    }
};

exports.updateTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params

        const { fullName } = req.body;
        const teacher = await teacherModel.findById(teacherId)

        if (!teacher) {
            return res.status(404).json({
                message: "Teacher not found"
            })
        };

        const data = {
            fullName
        }

        const updatedTeacher = await teacherModel.findByIdAndUpdate(teacherId, data, { new: true })

        res.status(200).json({
            message: "Teacher updated successfully",
            data: updatedTeacher
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error verifing user",
        });
    }


}


exports.updateStudent = async (req, res) => {
    try {
        const { studentId } = req.params

        const { fullName } = req.body;

        const student = await studentModel.findById(studentId)

        if (!student) {
            return res.status(404).json({
                message: "student not found"
            })
        };

        const data = {
            fullName
        }

        const updatedStudent = await studentModel.findByIdAndUpdate(student, data, { new: true })

        res.status(200).json({
            message: "student updated successfully",
            date: updatedStudent
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
}

exports.deleteStudent = async (req, res) => {
    try {
        const { studentId } = req.params

        const student = await studentModel.findById(studentId)

        if (!student) {
            return res.status(404).json({
                message: "student not found"
            })
        };

        await studentModel.findByIdAndDelete(studentId)

        res.status(200).json({
            message: "student deleted successfully",
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
}


exports.deleteTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params

        const teacher = await studentModel.findById(teacherId)

        if (!teacher) {
            return res.status(404).json({
                message: "student not found"
            })
        };

        await studentModel.findByIdAndDelete(teacherId)

        res.status(200).json({
            message: "teacher deleted successfully",
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
}


