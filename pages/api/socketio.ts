import { Server } from 'socket.io';

export const config = {
  api: {
    bodyParser: false
  }
}

export default (req, res) => {
  if (!res.socket.server.io) {
    console.log('*First use, starting socket.io');

    const io = new Server(res.socket.server);

    io.on('connection', socket => {
      socket.on('subscribe', ({ roomId }) => {
        socket.join(roomId);
      });
      socket.on('play', (event) => {
        socket.rooms.forEach(room => socket.to(room).emit('play', event));
      });
      socket.on('pause', (event) => {
        socket.rooms.forEach(room => socket.to(room).emit('pause', event));
      });
    });

    res.socket.server.io = io;
  } else {
    console.log('socket.io already running');
  }
  res.end();
};
