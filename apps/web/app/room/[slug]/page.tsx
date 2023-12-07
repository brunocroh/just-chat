"use client";

import { useEffect, useRef, useState } from "react";
import { socket as _socket } from "../../../lib/socket";
import { usePathname } from "next/navigation";

type UserProps = {
  id: string;
  muted?: boolean;
};

const User = ({ id, muted = false }: UserProps) => {
  return (
    <div key={id}>
      <video playsInline autoPlay={true} muted={muted}></video>
    </div>
  );
};

export default function Page(): JSX.Element {
  const pathname = usePathname();
  const videoRef = useRef(null);
  const [socket, setSocket] = useState(
    _socket({ query: pathname.split("/room/")[1] }),
  );
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);

  useEffect(() => {
    async function onConnect() {
      let peer: RTCPeerConnection;
      console.log("connected");
      setIsConnected(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      if (typeof window !== "undefined") {
        peer = new RTCPeerConnection({
          iceServers: [
            {
              urls: "stun:stun.stunprotocol.org",
            },
          ],
        });

        stream.getTracks().forEach((track) => peer.addTrack(track, stream));

        setPeerConnection(peer);
      }
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onUpdateUser(payload) {
      setConnectedUsers(payload.connectedUsers);
    }

    function createRoom(payload) {
      console.log("create", payload);
    }

    function enterRoom(payload) {
      console.log("entrou", payload);
    }

    socket.on("connect", onConnect);
    socket.on("createRoom", onConnect);
    socket.on("enterRoom", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("updateUserList", onUpdateUser);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("foo", onUpdateUser);
      socket.off("enterRoom", enterRoom);
      socket.off("createRoom", createRoom);
      if (peerConnection) {
        peerConnection.close();
      }
    };
  }, []);

  const onClickHandler = () => {
    console.log("batata");
    socket.connect();
  };
  return (
    <main className="flex flex-col h-full">
      <section className="flex p-5 justify-between">
        <h1>Header</h1>
        <h1>Github</h1>
      </section>
      <section className="flex h-full place-content-center align-center">
        <div>
          {connectedUsers.map((user) => (
            <p>user: {user}</p>
          ))}
        </div>
      </section>
    </main>
  );
}
