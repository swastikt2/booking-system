function setupWebSocket(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join entity-specific rooms for price updates
    socket.on('join:entity', ({ type, id }) => {
      const room = `${type.toLowerCase()}:${id}`;
      socket.join(room);
      console.log(`📡 ${socket.id} joined room: ${room}`);
    });

    socket.on('join:flight', ({ flightId }) => {
      socket.join(`flight:${flightId}`);
    });

    socket.on('join:hotel', ({ hotelId }) => {
      socket.join(`hotel:${hotelId}`);
    });

    socket.on('join:search', ({ searchType }) => {
      socket.join(`search:${searchType}`);
    });

    socket.on('leave:entity', ({ type, id }) => {
      socket.leave(`${type.toLowerCase()}:${id}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

module.exports = { setupWebSocket };
