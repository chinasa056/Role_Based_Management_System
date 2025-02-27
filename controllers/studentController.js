const studentModel = require("../models/student");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const teacherModel = require("../models/teacher")

exports.createStudent = async (req, res) => {
  try {
    const { teacherId } = req.params

    const { fullName, email, gender, password } = req.body

    const assignedTeacher = await teacherModel.findById(teacherId);
    if (!assignedTeacher) {
      return res.status(404).json({
        message: "Assigned teacher does not exist"
      })
    }

    const student = await studentModel.findOne({ email: email.toLowerCase() })
    if (student) {
      return res.status(400).json({
        message: ` Student with Email ${email} already exists`
      })
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newStudent = new studentModel({
      teacherId,
      fullName,
      email,
      gender,
      password: hashedPassword,
      teacherName: assignedTeacher.fullName
    })

    newStudent.IsVerified = true

    await newStudent.save()

    res.status(201).json({
      message: "Student created successfully",
      data: newStudent
    })

  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: 'Internal Server Error' + error.message
    })
  }
};


exports.logIn = async (req, res) => {
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
    const token = await jwt.sign({ userId: student._id }, process.env.JWT_SECRET, { expiresIn: '20min' })

    res.status(200).json({
      message: 'Login Successfully',
      data: student,
      token
    });

  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: 'Internal Server Error' + error.message
    })
  }
};

// exports.getOneStudent = async (req, res) => {
//   try {
//     const { studentId } = req.params.id;
//     const student = await studentModel.findById(studentId);
//     if (!student) {
//       return res.status(404).json({
//         message: "Student not found"
//       });
//     }
//     res.status(200).json({
//       message: "Student found successfully",
//       data: student
//     })

//   } catch (error) {
//     console.log(error.message);
//     res.status(500).json({
//       message: 'Internal Server Error' + error.message
//     })
//   }
// };
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