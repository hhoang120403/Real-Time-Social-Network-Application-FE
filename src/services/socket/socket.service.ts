import { io } from 'socket.io-client';

class SocketService {
  socket: any;

  setupSocketConnection() {
    this.socket = io(import.meta.env.VITE_BASE_ENDPOINT, {
      transports: ['websocket'],
      secure: true
    });

    this.socketConnectionEvents();
  }

  private socketConnectionEvents() {
    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log(`Reason: ${reason}`);
      this.socket.connect();
    });

    this.socket.on('connect_error', (error: any) => {
      console.log(`Error: ${error}`);
      this.socket.connect();
    });
  }
}

export const socketService = new SocketService();
