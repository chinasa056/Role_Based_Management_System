const { getAllTeachers, getAllStudents, updateTeacher, updateStudent, deleteStudent, deleteTeacher, registerAdmin } = require("../controllers/adminController");
const { adminAuth, superAdminAuth } = require("../middleware/authentication");

const router = require("express").Router();

router.post("/register/", registerAdmin)

router.get("/all_teachers", superAdminAuth, getAllTeachers)

router.get("/allstudents", superAdminAuth, getAllStudents)

router.patch("/update_teacher/:teacherId", superAdminAuth, updateTeacher)

router.patch("/student/:studentId", superAdminAuth, updateStudent)

router.delete("/student/:studentId", superAdminAuth, deleteStudent)

router.delete("/teacher/:teacherId", superAdminAuth, deleteTeacher)



module.exports = router