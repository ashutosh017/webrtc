import { useEffect, useRef } from "react";

export const Receiver = () => {
    const videoRef = useRef<HTMLVideoElement>(null)
  const startReceiving = (socket: WebSocket) => {
    const video = document.createElement("video");
    document.body.append(video);
    const pc = new RTCPeerConnection();
    pc.ontrack = (event) => {
    if(videoRef.current){
        videoRef.current.srcObject = new MediaStream([event.track])
    }
    };

    socket.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);
      console.log("parsed data: ", parsedData);
      if (parsedData.type === "createOffer") {
        (async () => {
          await pc?.setRemoteDescription(parsedData.sdp);
          const answer = await pc?.createAnswer();
          pc.onicecandidate = (ev)=>{
            socket.send(JSON.stringify({
                type:"iceCandidate",
                candidate:ev.candidate
            }))
          }
          await pc?.setLocalDescription(answer);
          socket?.send(
            JSON.stringify({
              type: "createAnswer",
              sdp: pc?.localDescription,
            })
          );
        })();
      }
      if (parsedData.type === "iceCandidate") {
        pc?.addIceCandidate(parsedData.candidate);
      }
    };
  };

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "receiver",
        })
      );
    };
    startReceiving(ws);
  }, []);
  return <div>
    <video ref={videoRef}></video>
    
  </div>;
};
