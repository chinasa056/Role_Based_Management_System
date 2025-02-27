
const { registerTeacher, login, verifyTeacher, getStudentByTeacher, updateStudent  } = require('../controllers/teacherController');
const { superAdminAuth, authenticate, adminAuth} = require('../middleware/authentication');

const router = require('express').Router();

router.post('/registerTeacher', superAdminAuth,  registerTeacher)
router.post('/login', authenticate,  login)
router.get('/teacher-verify/:token', adminAuth,  verifyTeacher)
router.post('/getStudent', adminAuth, getStudentByTeacher)
router.patch('/update', adminAuth, updateStudent)


module.exports = router;