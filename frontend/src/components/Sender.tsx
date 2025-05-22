
import { useRef } from "react";

export const Sender = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const startSendingVideo = async () => {
    const soc = new WebSocket("ws://localhost:8080");
    soc.onopen = async () => {
      soc.send(
        JSON.stringify({
          type: "sender",
        })
      );
      console.log("sender set");
      const pc = new RTCPeerConnection();
      pc.onnegotiationneeded = async () => {
        const offer = await pc.createOffer();
        pc.setLocalDescription(offer);
        soc.send(
          JSON.stringify({
            type: "createOffer",
            sdp: offer,
          })
        );
      };
      soc.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "createAnswer") {
          pc.setRemoteDescription(data.sdp);
        }
        if (data.type === "iceCandidate") {
          pc.addIceCandidate(data.candidate);
        }
      };
      pc.onicecandidate = async (event) => {
        if (event.candidate) {
          console.log("ice candidate received", event);
          soc.send(
            JSON.stringify({
              type: "iceCandidate",
              candidate: event.candidate,
            })
          );
          console.log("ice candidate sent");
        }
      };
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      if (videoRef.current) {
        console.log("stream set")
        videoRef.current.srcObject = stream;
      }
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    };
  };

  return (
    <div>
      <button className="" onClick={startSendingVideo}>
        send
      </button>
        <video className=""  style={{backgroundColor:"red"}} ref={videoRef} playsInline autoPlay
        />
    </div>
  );
};

