const Student = require('../models/Student');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const studentExists = await Student.findOne({ email });
    if (studentExists) {
      return res.status(400).json({ message: 'Student already exists' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const student = await Student.create({
      name,
      email,
      password: hashedPassword
    });
    
    res.status(201).json({ token: generateToken(student._id) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const student = await Student.findOne({ email });
    
    if (student && student.password && await bcrypt.compare(password, student.password)) {
      res.json({ token: generateToken(student._id) });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const googleCallback = (req, res) => {
  const token = generateToken(req.user._id);
  res.redirect(`${process.env.FRONTEND_URL}/login/success?token=${token}`);
};

module.exports = {
  registerStudent,
  loginStudent,
  googleCallback
};