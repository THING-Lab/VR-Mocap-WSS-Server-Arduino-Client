import express from "express";
import bodyParser from "body-parser";
import serverConfig from "../../config/ServerConfig";

import { writeToDisk, readFromDisk } from "../Utils/FileWriter";
import { startStream, shutdownStreams } from "../osc-client/osc-qtm";

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

var wemos_uuid_qtm = null;
var qtm_wemos_uuid = null;
var wemos_uuid = null;
var started = false;

const init = (data, mwemos_uuid_qtm, mqtm_wemos_uuid) => {
  wemos_uuid = data;
  wemos_uuid_qtm = mwemos_uuid_qtm;
  qtm_wemos_uuid = mqtm_wemos_uuid;
};

router.get("/startStreaming", (req, res) => {
  try {
    startStream("StreamFrames AllFrames 6DEuler");
    started = true;
  } catch (error) {
    shutdownStreams();
    console.log("Failed to create startStream: " + error);
    res.status(500).send("Failed to start...");
  }
  res.render("pages/setup", {
    title: "Server setup",
    wemos_uuid: wemos_uuid,
    wemos_uuid_qtm: wemos_uuid_qtm,
    st: started
  });
});

router.get("/stopStreaming", (req, res) => {
  try {
    shutdownStreams();
    started = false;
  } catch (error) {
    console.log("Failed to stopStream: " + error);
    res.status(500).send("Failed to stop....");
  }
  res.render("pages/setup", {
    title: "Server setup",
    wemos_uuid: wemos_uuid,
    wemos_uuid_qtm: wemos_uuid_qtm,
    st: started
  });
});

router.get("/setup", function(req, res) {
  res.render("pages/setup", {
    title: "Server setup",
    wemos_uuid: wemos_uuid,
    wemos_uuid_qtm: wemos_uuid_qtm,
    st: started
  });
});

router.post("/heartbeat", (req, res) => {
  console.log("[POST] Request");
  //console.log(req);
  res.status(200);
  res.send();
});

router.get("/", (req, res) => {
  res.sendFile("/a-frame/index.html", { root: "./" });
});

router.post("/updateDevice", (req, res) => {
  console.log("[POST] Request");
  console.log(req.body.uuid);
  var req_uuid = req.body.uuid;
  var req_qtm_id = req.body.value;

  if (!(typeof req_uuid === "undefined")) {
    res.status(200);
    if (req_qtm_id === "") {
      if (req_uuid in wemos_uuid_qtm) {
        delete wemos_uuid_qtm[req_uuid];
        res.send("Deleted!!!");
      } else {
        res.status(400);
        res.send("Failed!!!");
      }
    } else {
      wemos_uuid_qtm[req_uuid] = req_qtm_id;
      qtm_wemos_uuid[req_qtm_id] = req_uuid;
      writeToDisk(
        serverConfig.wemos_uuid_pair,
        wemos_uuid,
        serverConfig.wemos_uuid_qtm_pair,
        wemos_uuid_qtm
      );
      res.send("Updated!!!");
    }
  } else {
    res.status(400);
    res.send("Failed!!!");
  }
});

module.exports.router = router;
module.exports.init_router = init;
