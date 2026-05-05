const { generateQuestion } = require('../controllers/aiController');

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    socket.on('generate_question', async (data) => {
      await generateQuestion(socket, data);
    });
  });
};

module.exports = setupSocket;