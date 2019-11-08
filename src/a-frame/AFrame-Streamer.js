var wemos_uuid = null;
var wss = null;

const init = (ws, data) => {
  wss = ws;
  wemos_uuid = data;
};

const broadcast6DEuler = (wss, data) => {
  if (wss.clients) {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        data["6DEuler"] = true;
        client.send(JSON.stringify(data));
      }
    });
  }
};
const broadcastWemosEvents = (wss, data) => {
  if (wss.clients) {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        data["6DEuler"] = true;
        client.send(JSON.stringify(data));
      }
    });
  }
};
module.exports.initAframeWss = init;
