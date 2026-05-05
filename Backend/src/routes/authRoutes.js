const express = require('express');
const passport = require('passport');
const { registerStudent, loginStudent, googleCallback } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerStudent);
router.post('/login', loginStudent);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { session: false }), googleCallback);

module.exports = router;