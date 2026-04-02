const jwt = require('jsonwebtoken');
const User = require('../models/User');

const initializeSocket = (io) => {
  const boardRooms = new Map();

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'taskflow_secret_key_2024');
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name}`);

    socket.on('join-board', (boardId) => {
      socket.join(boardId);
      
      if (!boardRooms.has(boardId)) {
        boardRooms.set(boardId, new Set());
      }
      boardRooms.get(boardId).add(socket.user._id.toString());
      
      io.to(boardId).emit('user-joined', {
        userId: socket.user._id,
        userName: socket.user.name,
        users: Array.from(boardRooms.get(boardId))
      });
    });

    socket.on('leave-board', (boardId) => {
      socket.leave(boardId);
      
      if (boardRooms.has(boardId)) {
        boardRooms.get(boardId).delete(socket.user._id.toString());
        
        io.to(boardId).emit('user-left', {
          userId: socket.user._id,
          users: Array.from(boardRooms.get(boardId))
        });
      }
    });

    socket.on('board-updated', (data) => {
      socket.to(data.boardId).emit('board-updated', data.board);
    });

    socket.on('list-created', (data) => {
      socket.to(data.boardId).emit('list-created', data.list);
    });

    socket.on('list-updated', (data) => {
      socket.to(data.boardId).emit('list-updated', data.list);
    });

    socket.on('list-deleted', (data) => {
      socket.to(data.boardId).emit('list-deleted', data.listId);
    });

    socket.on('task-created', (data) => {
      socket.to(data.boardId).emit('task-created', {
        listId: data.listId,
        task: data.task
      });
    });

    socket.on('task-updated', (data) => {
      socket.to(data.boardId).emit('task-updated', {
        listId: data.listId,
        task: data.task
      });
    });

    socket.on('task-deleted', (data) => {
      socket.to(data.boardId).emit('task-deleted', {
        listId: data.listId,
        taskId: data.taskId
      });
    });

    socket.on('task-moved', (data) => {
      socket.to(data.boardId).emit('task-moved', data);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name}`);
    });
  });

  return io;
};

module.exports = initializeSocket;
