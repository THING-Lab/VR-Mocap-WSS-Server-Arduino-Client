var wemos_uuid = null;
var wss = null;
const ALPHABET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const delim = "@";

const ID_LENGTH = 8;

const init = (ws, data) => {
  wss = ws;
  wemos_uuid = data;
  wss.on("connection", function(clientSocket) {
    //clientSocket.send('Connected to server');
    console.log(
      "connected to client: " + JSON.stringify(clientSocket._socket.address())
    );

    clientSocket.on("message", function incoming(message) {
      console.log("received: %s", message);
      parseMessage(message, clientSocket);
    });

    clientSocket.on("ping", function incoming(message) {
      console.log("Ping received: %s", message);
      clientSocket.pong();
    });
    clientSocket.on("pong", function(message) {
      console.log(clientSocket.id + " receive a pong : " + message);
    });
  });

  wss.on("error", function(clientSocket) {
    //clientSocket.send('Connected to server');
    console.log("Error occurrect to client: " + JSON.stringify(clientSocket));
  });
};

const parseMessage = (message, clientSocket) => {
  if (message != null && message.length > 0) {
    var arr = message.split(delim);
    if (arr.length >= 2) {
      switch (arr[0]) {
        case "NEGOTIATE":
          var uuid = "";
          if (arr[1] in wemos_uuid) {
            uuid = wemos_uuid[arr[1]];
          } else {
            uuid = generate();
            wemos_uuid[arr[1]] = uuid;
          }
          console.log(
            "Sending a uuid: " +
              uuid +
              " to: " +
              JSON.stringify(clientSocket._socket.address())
          );
          clientSocket.send("UUID@" + uuid);
          break;
        case "EVENT":
          console.log("Click event received");
          break;
      }
    } else {
      console.log("received array length less 2 can't process");
    }
  }
};

const generate = function() {
  var rtn = "";
  for (var i = 0; i < ID_LENGTH; i++) {
    rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
  }
  return rtn;
};

module.exports.init_wemos_wss = init;
