const express = require('express')
const { logIn, getOneStudent, createStudent, getStudentDetails } = require('../controllers/studentController');
const { adminAuth, authenticate } = require('../middleware/authentication');
const router = express.Router();

router.post('/register', adminAuth, createStudent);
router.post('/login', authenticate, logIn);
router.get('/student', authenticate, getStudentDetails);


module.exports = router