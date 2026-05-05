const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);
      
      await Admin.create({
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword
      });
    }
  } catch (error) {
    process.exit(1);
  }
};

module.exports = seedAdmin;