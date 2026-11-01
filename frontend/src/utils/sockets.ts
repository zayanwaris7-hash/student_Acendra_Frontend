import { io, Socket } from "socket.io-client";

let chatSocket: Socket | null = null;

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL;

export const connectChatSocket = (accessToken: string): Socket => {
  if (!SOCKET_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  if (chatSocket) {
    if (chatSocket.auth && chatSocket.connected) {
      return chatSocket;
    }

    if (!chatSocket.connected) {
      chatSocket.auth = { token: accessToken };
      chatSocket.connect();
      return chatSocket;
    }
  }

  chatSocket = io(`${SOCKET_URL}/chats`, {
    auth: {
      token: accessToken,
    },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return chatSocket;
};

export const getChatSocket = () => chatSocket;

export const disconnectChatSocket = () => {
  chatSocket?.disconnect();
  chatSocket = null;
};