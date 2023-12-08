"use client";

import { useEffect, useRef, useState, ReactElement } from "react";
import { socket } from "../../../lib/socket";
import { usePathname } from "next/navigation";

type UserProps = {
  id: string;
  muted?: boolean;
};

const User = ({ id, muted = false }: UserProps) => {
  return (
    <div key={id}>
      <video ref={ref} playsInline autoPlay={true} muted={muted}></video>
    </div>
  );
};

const createPeerConnection = () => {
  return new RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.stunprotocol.org",
      },
    ],
  });
};

export default function Page(): JSX.Element {
  const pathname = usePathname();
  const room = pathname.split("/room/")[1];
  const videoRef = useRef<ReactElement<HTMLVideoElement>>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);
  const [currentRoom, setCurrentRoom] = useState<any>(null);

  useEffect(() => {
    let _socket = socket();
    let peer: RTCPeerConnection;

    async function onConnect() {
      setIsConnected(true);
      _socket.emit("enterRoom", { room });

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      if (typeof window !== "undefined") {
        peer = createPeerConnection();
        stream.getTracks().forEach((track) => peer.addTrack(track, stream));
        setPeerConnection(peer);
      }
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onUpdateUserList(payload) {
      console.log("Received users");
      setConnectedUsers(payload.connectedUsers);
    }

    async function onRoomDetails(payload) {
      console.log("onRoomDetails called");
      console.log({ payload, id: _socket.id });
      if (!payload.users) {
        const localPeerOffer = await peer.createOffer();
        await peer.setLocalDescription(
          new RTCSessionDescription(localPeerOffer),
        );

        _socket.emit("mediaOffer", {
          room,
          offer: localPeerOffer,
          owner: _socket.id,
        });
        return;
      }

      try {
        await peer.setRemoteDescription(
          new RTCSessionDescription(payload.offer),
        );
        const peerAnswer = await peer.createAnswer();
        await peer.setLocalDescription(new RTCSessionDescription(peerAnswer));

        _socket.emit("mediaAnswer", {
          answer: peerAnswer,
          from: _socket.id,
          to: payload.owner,
        });
      } catch (error) {
        console.log({ error });
      }
      // setCurrentRoom(payload.room);
    }

    async function onMediaOffer(data) {
      try {
        await peer.setRemoteDescription(new RTCSessionDescription(data.offer));
        const peerAnswer = await peer.createAnswer();
        await peer.setLocalDescription(new RTCSessionDescription(peerAnswer));

        _socket.emit("mediaAnswer", {
          answer: peerAnswer,
          from: _socket.id,
          to: data.from,
        });
      } catch (error) {
        // Handle error
      }
    }

    async function onMediaAnswer(data) {
      try {
        await peer.setRemoteDescription(new RTCSessionDescription(data.offer));
        const peerAnswer = await peer.createAnswer();
        await peer.setLocalDescription(new RTCSessionDescription(peerAnswer));

        _socket.emit("mediaAnswer", {
          answer: peerAnswer,
          from: _socket.id,
          to: data.from,
        });
      } catch (error) {
        // Handle error
      }
    }

    function onRoomCreated(payload) {
      console.log({ payloadCreated: payload });
    }

    async function onRemotePeerIceCandidate(data) {
      try {
        const candidate = new RTCIceCandidate(data.candidate);
        await peer.addIceCandidate(candidate);
      } catch (error) {
        // Handle error
      }
    }

    _socket.on("connect", onConnect);
    _socket.on("disconnect", onDisconnect);
    _socket.on("updateUserList", onUpdateUserList);
    _socket.on("roomDetails", onRoomDetails);
    _socket.on("roomCreated", onRoomCreated);
    _socket.on("remotePeerIceCandidate", onRemotePeerIceCandidate);

    return () => {
      _socket.off("connect", onConnect);
      _socket.off("disconnect", onDisconnect);
      _socket.off("updateUserList", onUpdateUserList);
      _socket.off("roomDetails", onRoomDetails);
      _socket.off("roomCreated", onRoomCreated);
      _socket.off("mediaOffer", onMediaOffer);
      _socket.off("mediaAnswer", onMediaAnswer);
      _socket.off("remotePeerIceCandidate", onRemotePeerIceCandidate);
      if (peerConnection) {
        peerConnection.close();
      }
      _socket.disconnect();
      setIsConnected(false);
    };
  }, []);

  return (
    <main className="flex flex-col h-full">
      <section className="flex p-5 justify-between">
        <h1>Header</h1>
        <h1>Github</h1>
      </section>
      <section
        className={`flex h-full place-content-center align-center ${
          isConnected ? "bg-green-500" : "bg-red-500"
        }`}
      >
        <div>
          <video
            ref={videoRef}
            playsInline
            autoPlay={true}
            muted={true}
          ></video>
        </div>
      </section>
    </main>
  );
}
