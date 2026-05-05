require('dotenv').config();
const app = require('./src/app');
const seedAdmin = require('./src/config/seedAdmin');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await seedAdmin();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();