import { useEffect, useRef } from "react";

export const Receiver = () => {
  const socketRef = useRef<WebSocket | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    socketRef.current = new WebSocket("ws://localhost:8080");
    socketRef.current.onopen = async () => {
      const pc = new RTCPeerConnection();
      if (!socketRef.current) {
        return;
      }
      socketRef.current.send(
        JSON.stringify({
          type: "receiver",
        })
      );
      socketRef.current.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "createOffer") {
          pc.setRemoteDescription(data.sdp);
          const answer = await pc.createAnswer();
          pc.setLocalDescription(answer);
          socketRef.current?.send(
            JSON.stringify({
              type: "createAnswer",
              sdp: answer,
            })
          );
        }
        if (data.type === "iceCandidate") {
          pc.addIceCandidate(data.candidate);
        }
      };
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current?.send(
            JSON.stringify({
              type: "iceCandidate",
              candidate: event.candidate,
            })
          );
        }
      };
      pc.ontrack = (event) => {
        const stream = new MediaStream();
        stream.addTrack(event.track);
        console.log("event track: ", event);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      };
    };

    return () => {
      socketRef.current?.close();
    };
  }, []);

  return (
    <div>
      Receiver
      <video ref={videoRef} playsInline autoPlay />
    </div>
  );
};

