import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let senderSocket: null | WebSocket = null;
let recieverSocket: null | WebSocket = null;

wss.on("listening", () => {
  console.log("websocket server is listening");
});

wss.on("connection", (socket: WebSocket) => {
  socket.onerror = () => console.error;
  socket.onmessage = (ev) => {
    const message = JSON.parse(ev.data);
    if (message.type === "sender") {
      senderSocket = socket;
      console.log("sender set")
    }
    if (message.type === "reciever") {
      recieverSocket = socket;
      console.log("reciever set")
    }
    if (message.type === "createOffer" && socket !== senderSocket) {
      return;
    }
    if (message.type === "createOffer" && socket === senderSocket) {
      recieverSocket?.send(
        JSON.stringify({
          type: "createOffer",
          sdp: message.sdp,
        })
      );
      console.log("offer sent")
    }
    if (message.type === "createAnswer" && socket !== recieverSocket) {
      return;
    }
    if (message.type === "createAnswer" && socket === recieverSocket) {
      senderSocket?.send(
        JSON.stringify({
          type: "createAnswer",
          sdp: message.sdp,
        })
      );
      console.log("answer sent")
    }
    if (message.type === "iceCandidate" && socket === recieverSocket) {
      senderSocket?.send(
        JSON.stringify({
          type: "iceCandiate",
          candidate: message.candidate,
        })
      );
      console.log("ice candidate set for reciever")
    }
    if (message.type === "iceCandidate" && socket === senderSocket) {
      recieverSocket?.send(
        JSON.stringify({
          type: "iceCandidate",
          candidate: message.candidate,
        })
      );
      console.log("ice candidate set for sender")
    }
  };
});
