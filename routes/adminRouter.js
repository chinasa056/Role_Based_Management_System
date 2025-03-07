const { getAllTeachers, getAllStudents, updateTeacher, updateStudent, deleteStudent, deleteTeacher, registerAdmin, changePassword, forgotPassword, removeTeacherAdminAccess, getStudentByStack, verifyAdmin, loginAdmin, resetPassword, dynamicUpdateStudent } = require("../controllers/adminController");
const { superAdminAuth, authenticate, adminAuth } = require("../middleware/authentication");

const router = require("express").Router();

router.get("/admin_verify/:token", verifyAdmin)

router.post("/register/", registerAdmin)

router.post("/login", loginAdmin)

router.post("/forgot_password", forgotPassword);

router.post("/reset_password", resetPassword)

// router.post("/change_password", changePassword)

router.post("/forgot_password", authenticate, forgotPassword)

router.post("/change-password", authenticate, changePassword)


router.get("/all_teachers", superAdminAuth, getAllTeachers)

router.get("/allstudents", superAdminAuth, getAllStudents)

router.get("/student/stack/:studentId", adminAuth, getStudentByStack)

router.patch("/update_teacher/:teacherId", superAdminAuth, updateTeacher)

router.patch("/student/update/:studentId", superAdminAuth, updateStudent)

router.delete("/student/:studentId/:teacherId", superAdminAuth, deleteStudent)

router.delete("/teacher/:teacherId", superAdminAuth, deleteTeacher)

router.post("/remove/admin/:teacherId", superAdminAuth, removeTeacherAdminAccess)

// router.patch("/student/update/:studentId/:teacherId", superAdminAuth, dynamicUpdateStudent )




module.exports = router