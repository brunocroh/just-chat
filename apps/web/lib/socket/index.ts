import { io, Socket } from "socket.io-client";

const URL = "http://localhost:4000";

export const socket = ({ query }: any): Socket => {
  return io(URL, { query });
};
