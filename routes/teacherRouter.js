
const { register, login, verifyTeacher, getStudentByTeacher, updateStudent  } = require('../controllers/teacherController');
const { superAdminAuth, authenticate, adminAuth} = require('../middleware/authentication');

const router = require('express').Router();

router.post('/register', superAdminAuth,  register)
router.post('/login', authenticate,  login)
router.post('/teacher-verify', adminAuth,  verifyTeacher)
router.post('/getStudent', adminAuth, getStudentByTeacher)
router.patch('/update', adminAuth, updateStudent)


module.exports = router;