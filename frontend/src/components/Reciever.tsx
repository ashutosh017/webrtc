import { useEffect } from "react";
// import {useRef} from 'react'
export function Reciever() {
  // const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    socket.onopen = () => {
      console.log("socket opend")
      socket.send(
        JSON.stringify({
          type: "reciever",
        })
      );
    };
    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      console.log("some message recieved: ", data)
      let pc: RTCPeerConnection | null = null;
      if (data.type === "createOffer") {
        console.log("offer recieved")
        pc = new RTCPeerConnection();
        pc.setRemoteDescription(data.sdp);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log(answer)
        console.log(pc.localDescription)
        socket.send(
          JSON.stringify({
            type: "createAnswer",
            sdp: answer,
          })
        );
        console.log("answer sent")
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.send(
              JSON.stringify({
                type: "iceCandidate",
                candidate: event.candidate,
              })
            );
          }
          console.log("ice candidate sent")
        };

        pc.ontrack = (event) => {

          console.log("pc on track ")
          console.log('pc ontrack: ',event)
          // if(videoRef.current){
          //   videoRef.current.srcObject = new MediaStream([event.track])
          //   videoRef.current.play()
          // }
          const video = document.createElement('video')
          document.body.appendChild(video)
          video.srcObject = new MediaStream([event.track])
          video.play()
        };


      }
      if (data.type === "iceCandidate" && pc !== null) {
        pc.addIceCandidate(data.candidate);
      }
    };
  }, []);
  return (
    <div>
      Reciever
    </div>
  );
}
