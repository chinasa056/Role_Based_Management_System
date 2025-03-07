
const { registerTeacher, login, verifyTeacher, getStudentByTeacher, updateStudent  } = require('../controllers/teacherController');
const { superAdminAuth, authenticate, adminAuth} = require('../middleware/authentication');

const router = require('express').Router();

router.post('/registerTeacher', superAdminAuth,  registerTeacher)
router.post('/login/teacher',  login)
router.get('/teacher-verify/:token', adminAuth,  verifyTeacher)
router.get('/getStudent/:teacherId', adminAuth, getStudentByTeacher)
router.patch('/update', adminAuth, updateStudent)


module.exports = router;