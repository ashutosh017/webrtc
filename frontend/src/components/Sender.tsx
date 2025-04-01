import { useEffect, useState } from "react";

export const Sender = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [pcObj, setpcObj] = useState<RTCPeerConnection | null>(null);
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    setSocket(ws);
    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "sender",
        })
      );
    };
  }, []);

  const initConnection = async () => {
    if (!socket) {
      console.log("no socket found");
      return;
    }
    socket.onmessage = (event) => {
      const parsedMessage = JSON.parse(event.data);
      if (parsedMessage.type === "createAnswer") {
        pcObj?.setRemoteDescription(parsedMessage.sdp);
      }
      if (parsedMessage.type === "iceCandidate") {
        pcObj?.addIceCandidate(parsedMessage.candidate);
      }
    };
    const pc = new RTCPeerConnection();
    setpcObj(pc);
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.send(
          JSON.stringify({
            type: "iceCandidate",
            candidate: event.candidate,
          })
        );
      }
    };
    pc.onnegotiationneeded = async () => {
      const offer = await pc.createOffer();
      pc.setLocalDescription(offer);
      socket?.send(
        JSON.stringify({
          type: "createOffer",
          sdp: pc.localDescription,
        })
      );
    };
    getCameraStreamAndSend(pcObj!);
  };

  const getCameraStreamAndSend = async (pc: RTCPeerConnection) => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.createElement("video");
    video.srcObject = stream;
    video.play();
    document.body.append(video);
    stream.getTracks().forEach((track) => {
      pc?.addTrack(track);
    });
  };

  const handleClick = () => {
    initConnection();
  };

  return (
    <div>
      <button onClick={handleClick}>Send</button>
      sender
    </div>
  );
};
