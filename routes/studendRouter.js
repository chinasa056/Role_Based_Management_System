const express = require('express')
const { logIn, createStudent, getStudentDetails } = require('../controllers/studentController');
const { authenticate, superAdminAuth } = require('../middleware/authentication');
const router = express.Router();

router.post('/register/student/:teacherId', superAdminAuth, createStudent);
router.post('/login/student', logIn);
router.get('/student/details',authenticate, getStudentDetails);


module.exports = router