const express = require('express');
const { register } = require('../controllers/teacherController');

const router = require('express').Router();

router.post('/register',  register)

router.

module.exports = router;