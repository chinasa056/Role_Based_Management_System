const adminModel = require("../models/admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { signUpTemplate } = require("../utils/mailTemplate");
const { sendEmail } = require("../middleware/nodemailer");
const studentModel = require("../models/student");
const teacherModel = require("../models/teacher");

// ONBOARDING STAGE
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
            { expiresIn: "1hour" });

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

                    const admin = await adminModel.findById(decodedToken.userId);

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
                    )}/api/v1/admin_verify/${newToken}`;
                    const firstName = admin.fullName.split(" ")[0];

                    // pass the mail options into an object variable
                    const mailDetails = {
                        email: admin.email,
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
                const Admin = await adminModel.findById(payload.userId);
                if (Admin === null) {
                    return res.status(404).json({
                        message: "Admin not found",
                    });
                }

                if (Admin.isVerified === true) {
                    return res.status(400).json({
                        message: "Admin has already been verified",
                    });
                }

                Admin.isVerified = true;
                await Admin.save();

                res.status(200).json({
                    message: "admin verified successfully",
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

exports.forgotPassword = async (req, res) => {
    try {
        // get the email from the request boddy
        const { email } = req.body;

        if (email == null) {
            return res.status(400).json({
                message: "Please enter your email"
            })
        };

        const admin = await adminModel.findOne({ email: email.toLowerCase() })
        if (!user) {
            return res.status(404).json({
                message: "user not found"
            })
        };

        // generate a token for the user
        const token = await jwt.sign({ userid: user._id }, process.env.JWT_SECRET, { expiresIn: "10mins" })

        const link = `${req.protocol}: //${req.get("host")}/api/v1/forgot_password/${token}`
        const firstName = admin.fullName.split(" ")[0]

        // pass the email details to a variable
        const mailDetails = {
            subject: "password reset",
            email: user.email,
            html: forgotPasswordTemplate(link, firstName)
        }

        // await nodemailer to send the email
        await sendEmail(mailDetails)

        // send a sucess response
        res.status(200).json({
            message: "Reset password initiated, please check your eamil for the reset link "
        })

    } catch (error) {
        console.error(error);
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(500).json({
                message: "Link Expired"
            })
        }
        res.status(500).json({
            message: "Internal server error"
        })
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params
        const { password, confirmPassword } = req.body;
        // verify the token id dtill valid, extract the userID from the tokn and use it to find the usr in the database
        const { adminId } = await jwt.verify(token, process.env.JWT_SECRET);
        // find the user in the database
        const admin = await adminModel.findById(adminId)

        if (!admin) {
            return res.status(404).json({
                message: "Admin not found"
            })
        };

        // confirm the password matches the confirm password
        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Password does not match"
            })
        };

        // generate a salt and hash password for the user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        admin.password = hashedPassword

        // save the changes to the database
        await user.save()

        // senda sucess response
        res.status(200).json({
            message: "Password reset successful"
        })


    } catch (error) {
        console.error(error);
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(500).json({
                message: "Link Expired"
            })
        }
        res.status(500).json({
            message: "Internal server error"
        })
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { password, newPassword, confirmPassword } = req.body;
        const { adminId } = req.user;

        const admin = await adminModel.findById(adminId);
        if (!useradmin) {
            return res.status(404).json({
                message: "User not found"
            })
        };

        // verify the current password
        const passwordVerify = await bcrypt.compare(password, admin.password)
        if (passwordVerify === false) {
            return res.status(404).json({
                message: "incorrect password"
            })
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: "new password and confirm password does not match"
            })
        };
        //  encrypt the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt)

        admin.password = hashedPassword;

        await admin.save();

        res.status(200).json({
            message: "Password changed successfully"
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        })
    }
}


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
            { expiresIn: "1day" }
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

//  CRUD OPERATIONS
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

exports.getStudentByStack = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { stack } = req.body;

        const student = await studentModel.findOne({ _id: studentId }, { stack: stack });

        if (!student) {
            return res.status(404).json({
                message: 'Student not found'
            })
        };

        res.status(200).json({
            message: 'Student info below',
            data: student
        })
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Error Getting student'
        })
    }
}

exports.updateTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params

        const { fullName, stack } = req.body;
        const teacher = await teacherModel.findById(teacherId)

        if (!teacher) {
            return res.status(404).json({
                message: "Teacher not found"
            })
        };

        const data = {
            fullName,
            stack
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

        const { fullName} = req.body;

        const student = await studentModel.findById(studentId)

        if (!student) {
            return res.status(404).json({
                message: "student not found"
            })
        };

        const data = {
            fullName
        }

        const updatedStudent = await studentModel.findByIdAndUpdate(studentId, data, { new: true })

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
        const { studentId, teacherId } = req.params

        const student = await studentModel.findById(studentId)
        const teacher = await teacherModel.findById(teacherId)

        if (!student) {
            return res.status(404).json({
                message: "student not found"
            })
        };

        if (!teacher) {
            return res.status(404).json({
                message: "student not found"
            })
        };

        const deletedStudent = await studentModel.findByIdAndDelete(studentId)
        if(deletedStudent) {
            teacher.studentsId.pop(studentId)
        }

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

        const teacher = await teacherModel.findById(teacherId)

        if (!teacher) {
            return res.status(404).json({
                message: "Teacher not found"
            })
        };

        await teacherModel.findByIdAndDelete(teacherId)

        res.status(200).json({
            message: "teacher deleted successfully",
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};

exports.removeTeacherAdminAccess = async (req, res) => {
    try {
        const { teacherId } = req.params;

        const teacher = await teacherModel.findById(teacherId);

        if (!teacher) {
            return res.status(404).json({
                message: "Teacher not found"
            })
        };

        if (teacher.isAdmin === true) {
            teacher.isAdmin = false;
        }

        await teacher.save();

        res.status(200).json({
            message: "Admin access removed successfully"
        })

    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: "Internal Server Error"
        })

    }
}


// exports.updateStudent = async (req, res) => {
//     try {
//         const { studentId } = req.params;
//         const { fullName, stack } = req.body;

//         const student = await studentModel.findById(studentId);

//         if (!student) {
//             return res.status(404).json({
//                 message: "Student not found"
//             });
//         }

        
//         let currentTeacher = await teacherModel.findOne({ studentsId: studentId });
//         if (currentTeacher) {
//             currentTeacher.studentsId.pull(studentId);
//             await currentTeacher.save();
//         }

//         // Update the student's details
//         const data = { fullName, stack };
//         const updatedStudent = await studentModel.findByIdAndUpdate(studentId, data, { new: true });

        
//         const newTeacher = await teacherModel.findOne({ stack: data.stack });
//         if (newTeacher) {
//             newTeacher.studentsId.push(updatedStudent._id);
//             await newTeacher.save();

//             data.teacherName = newTeacher.fullName;
//             data.assignedTeacher = newTeacher.fullName;
//         }

//         await updatedStudent.save();

//         res.status(200).json({
//             message: "Student updated successfully",
//             data: updatedStudent
//         });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             message: "Internal server error",
//             error: error.message
//         });
//     }
// };
