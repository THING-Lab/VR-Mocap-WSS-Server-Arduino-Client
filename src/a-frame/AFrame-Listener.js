import { type } from "os";

const socket = null;
var socketClosed = true;

const startListening = (callBackOnMessage = null) => {
  if (socket == null || socket == undefined || socketClosed) {
    socket = new WebSocket("ws://0.0.0.0:44523");
  }
  // Connection opened
  socket.addEventListener("open", function(event) {
    // socket.send('Hello Server!');
    socketClosed = false;
    console.log("connection was open... ", event.data);
  });
  // Listen for messages
  socket.addEventListener("message", function(event) {
    console.log(
      "Message from server ",
      event.data,
      " type of message: ",
      typeof message
    );
    if (callBackOnMessage) {
      callBackOnMessage(message);
    }
  });

  socket.addEventListener("close", event => {
    console.log("The connection has been closed.");
    socketClosed = true;
  });
};

const stopListening = () => {
  if (socket) {
    try {
      socket.close();
    } catch (err) {
      console.log("WS - Socket closed.");
    }
  }
};

const wsMessageParser = message => {
  if (message) {
    try {
      if (message["6deuler"] || message["wemos"]) {
        return message;
      } else {
        console.log("don't know the message type.");
        return null;
      }
    } catch (err) {
      console.log("wsMessageParser. Error in reading message. ");
    }
  }
};
