
const { register } = require('../controllers/teacherController');
const { superAdminAuth } = require('../middleware/authentication');

const router = require('express').Router();

router.post('/register', superAdminAuth,  register)

router.

module.exports = router;