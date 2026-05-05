const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Student = require('../models/Student');
require('dotenv').config();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let student = await Student.findOne({ email: profile.emails[0].value });
    
    if (student) {
      if (!student.googleId) {
        student.googleId = profile.id;
        await student.save();
      }
      return done(null, student);
    }
    
    student = await Student.create({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value
    });
    
    done(null, student);
  } catch (error) {
    done(error, false);
  }
}));