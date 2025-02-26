const express = require('express')
const { register, logIn, getOneStudent, createStudent } = require('../controllers/studentController');
const { adminAuth, authenticate } = require('../middleware/authentication');
const router = express.Router();

router.post('/register', adminAuth, createStudent);
router.post('/login', authenticate, logIn);
router.get('/student',getOneStudent);


module.exports = router;