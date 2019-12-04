const WebSocket = require("ws");
var wemos_uuid = null;
var wss = null;

const init = (ws, data) => {
  wss = ws;
  wemos_uuid = data;
};

const broadcast6DEuler = data => {
  if (wss.clients) {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        data["6d_euler"] = true;
        client.send(JSON.stringify(data));
      }
    });
  }
};
const broadcastWemosEvents = data => {
  if (wss.clients) {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        data["wemos"] = true;
        client.send(JSON.stringify(data));
      }
    });
  }
};
module.exports.initAframeWss = init;
module.exports.broadcast6DEuler = broadcast6DEuler;
module.exports.broadcastWemosEvents = broadcastWemosEvents;
