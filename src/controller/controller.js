import express from "express";
import bodyParser from "body-parser";

import { writeToDisk, readFromDisk } from "../Utils/FileWriter";
import { startStream, shutdownStreams } from "../osc-client/osc-qtm";

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

var wemos_uuid_qtm = null;
var qtm_wemos_uuid = null;
var wemos_uuid = null;

const init = (data, mwemos_uuid_qtm, mqtm_wemos_uuid) => {
  wemos_uuid = data;
  wemos_uuid_qtm = mwemos_uuid_qtm;
  qtm_wemos_uuid = mqtm_wemos_uuid;
};

router.get("/startStreaming", (req, res) => {
  try {
    startStream("StreamFrames AllFrames 6DEuler");
  } catch (error) {
    shutdownStreams();
    console.log("Failed to create startStream: " + error);
    res.status(500).send("Failed");
  }
  res.status(200).send("Started");
});

router.get("/stopStreaming", (req, res) => {
  try {
    shutdownStreams();
  } catch (error) {
    console.log("Failed to stopStream: " + error);
    res.status(500).send("Failed");
  }
  res.status(200).send("Hello World!");
});

router.get("/devices", function(req, res) {
  res.render("pages/setup", {
    title: "Connected devices to server",
    wemos_uuid: wemos_uuid,
    wemos_uuid_qtm: wemos_uuid_qtm
  });
});

router.post("/heartbeat", (req, res) => {
  console.log("[POST] Request");
  //console.log(req);
  res.status(200);
  res.send();
});

router.get("/",(req,res)=>{
  res.sendFile("/a-frame/index.html",{root: './'})
})

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
        "wemos_uuid.json",
        wemos_uuid,
        "wemos_uuid_qtm.json",
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
