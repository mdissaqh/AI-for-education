require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const app = require('./src/app');
const { generateQuestion } = require('./src/controllers/aiController');

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Database Connected'))
  .catch(err => console.log(err));

io.on('connection', (socket) => {
  socket.on('generate_question', (data) => {
    generateQuestion(socket, data);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});