import express from "express";
import WebSocket from "ws";

import serverConfig from "./config/ServerConfig";
import { startOscListener, stopOscListener } from "./src/osc-client/osc-qtm";
import { initWemosWss } from "./src/controller/wemos-wss";
import { router, init_router } from "./src/controller/controller";

const wemos_uuid = new Object();
const app = express();
const wssWemos = new WebSocket.Server({ port: serverConfig.wemos_stream_port });
const wssAFrame = new WebSocket.Server({ port: serverConfig.aframe_stream_port });


app.set("view engine", "ejs");
app.use(express.static(__dirname + "/"));
app.use("/", router);
init_router(wemos_uuid);

try {
  initWemosWss(wssWemos, wemos_uuid);
} catch (err) {
  console.log("Failed to initWemosWss: " + err);
}

try {
  initAframeWss(wssWemos, wemos_uuid);
} catch (err) {
  console.log("Failed to initAframeWss: " + err);
}

try {
  var server = startOscListener();
} catch (error) {
  console.log("Failed to start OSC - Listener: " + error);
  console.log("Gracefully shutdown listener");
  stopOscListener();
}

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/heartbeat", (req, res) => {
  console.log("[GET] Request");
  //console.log(req);
  res.status(200);
  res.send();
});

app.listen(serverConfig.server_http_port, "0.0.0.0", function() {
  console.info("Server running on port: " + serverConfig.server_http_port);
});
