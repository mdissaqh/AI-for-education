require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const setupSocket = require('./src/config/socket');

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const io = new Server(server);

setupSocket(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});