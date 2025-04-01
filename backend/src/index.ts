import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let senderSocket: null | WebSocket = null;
let receiverSocket: null | WebSocket = null;

wss.on("listening", () => {
  console.log("websocket server is listening");
});

wss.on("connection", (socket: WebSocket) => {
  console.log("someone connected");
  socket.onerror = () => console.error;
  socket.onmessage = (ev) => {
    const message = JSON.parse(ev.data);
    if (message.type === "sender") {
      senderSocket = socket;
      console.log("sender set")
    }
    if (message.type === "receiver") {
      receiverSocket = socket;
      console.log("receiver set")
    }
    if (message.type === "createOffer" && socket !== senderSocket) {
      return;
    }
    if (message.type === "createOffer" && socket === senderSocket) {
      receiverSocket?.send(
        JSON.stringify({
          type: "createOffer",
          sdp: message.sdp,
        })
      );
      console.log("offer sent")
    }
    if (message.type === "createAnswer" && socket !== receiverSocket) {
      return;
    }
    if (message.type === "createAnswer" && socket === receiverSocket) {
      senderSocket?.send(
        JSON.stringify({
          type: "createAnswer",
          sdp: message.sdp,
        })
      );
      console.log("answer sent")
    }
    if (message.type === "iceCandidate" && socket === receiverSocket) {
      senderSocket?.send(
        JSON.stringify({
          type: "iceCandiate",
          candidate: message.candidate,
        })
      );
      console.log("ice candidate set for receiver")
    }
    if (message.type === "iceCandidate" && socket === senderSocket) {
      receiverSocket?.send(
        JSON.stringify({
          type: "iceCandidate",
          candidate: message.candidate,
        })
      );
      console.log("ice candidate set for sender")
    }
  };
});
