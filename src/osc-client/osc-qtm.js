var osc = require("osc");

var QTMServerAddress = '127.0.0.1';
const QTM_RT_OSC_PORT = 22225; //base +4 port :xD
var udpPortClinet = null;
var udpPortClinet_shut = null;
var udpPortServer = null;
//default listener port
var QTM_RT_OSC_LISTENER_PORT = 31004;

//returns the client. Use it to subscribe to other components.
const createSocket = (addr, port) =>{
  return new osc.UDPPort({
    localAddress: addr,
    localPort: port,
    metadata: true
  });
}

const startStream = (components, qtmServerAddr = QTMServerAddress) => {
  QTMServerAddress = qtmServerAddr;
  if(udpPortClinet!=null){
    console.log("[OSC Client] Closing existing socket....");
    udpPortClinet.close();
    udpPortClinet = null;
  }
  udpPortClinet = createSocket(QTMServerAddress, 54663)
  udpPortClinet.on("message", function (oscMsg, timeTag, info) {
      console.log("[OSC Client] An OSC message just arrived!", oscMsg);
      console.log("[OSC Client] Remote info is: ", info);
    });
    // Open the socket.
    udpPortClinet.open();
    console.log(udpPortClinet);
    console.log("[OSC Client] - Openning port :"+ QTM_RT_OSC_PORT);
    udpPortClinet.on("ready", function () {
      console.log("[OSC Client] ready - sending message to QTM to connect on port: " + QTM_RT_OSC_LISTENER_PORT);
      udpPortClinet.send({
          address: "/qtm",
          args: [
              {
                  type: "s",
                  value: "Connect"
              },
              {
                  type: "i",
                  value: QTM_RT_OSC_LISTENER_PORT
              }
          ]
      }, QTMServerAddress, QTM_RT_OSC_PORT);
      udpPortClinet.send({
        address: "/qtm",
        args: [
            {
                type: "s",
                value: components
            }
        ]
    }, QTMServerAddress, QTM_RT_OSC_PORT);
  });
  return udpPortClinet;  
};

const stop = (qtmServerAddr = QTMServerAddress) => {
  QTMServerAddress = qtmServerAddr;
  if(udpPortClinet_shut!=null){
    console.log("[OSC Client] Closing existing socket....");
    udpPortClinet_shut.close();
    udpPortClinet_shut = null;
  }
  udpPortClinet_shut = createSocket(QTMServerAddress, 54699)
  udpPortClinet_shut.on("message", function (oscMsg, timeTag, info) {
      console.log("[OSC Client] An OSC message just arrived! - shut-down channel", oscMsg);
      console.log("[OSC Client] Remote info is: ", info);
    });

    // Open the socket.
    udpPortClinet_shut.open();
    console.log(udpPortClinet_shut)
    udpPortClinet_shut.on("ready", function () {
      console.log("[OSC Client] Sending stutdown command. ");
      udpPortClinet_shut.send({
          address: "/qtm",
          args: [
              {
                  type: "s",
                  value: "Connect"
              },
              {
                  type: "i",
                  value: QTM_RT_OSC_LISTENER_PORT
              }
          ]
      }, QTMServerAddress, QTM_RT_OSC_PORT);
      udpPortClinet_shut.send({
        address: "/qtm",
        args: [
            {
                type: "s",
                value: "disconnect Stop"
            }
        ]
    }, QTMServerAddress, QTM_RT_OSC_PORT);
  });
  return udpPortClinet;  
};

const startOscListener = (LISTENER_PORT=QTM_RT_OSC_LISTENER_PORT) =>{
  QTM_RT_OSC_LISTENER_PORT = LISTENER_PORT;
  udpPortServer = createSocket('127.0.0.1', QTM_RT_OSC_LISTENER_PORT);
  udpPortServer.on("ready", function () {  
    console.log("Listening for OSC over UDP.");
  });
  
  udpPortServer.on("message", function (oscMessage) {
    console.log("[OSC Server]" + JSON.stringify(oscMessage));
  });
  
  udpPortServer.on("error", function (err) {
    console.log(err);
  });
  udpPortServer.open();
  return udpPortServer;
}

const stopOscListener = () =>{
  if(udpPortServer){
    udpPortServer.close();
  }
}

//Gracefully shut down the streams? why not? duhh
process.on('SIGINT', (signal) => {
  console.log("[osc-qtm] " + signal + ' signal received.');
  stop();
  stopOscListener();
  process.exitCode = 0;
});

process.on('exit', (signal) => {
  console.log("[osc-qtm] " + signal + ' signal received.');
  stop();
  stopOscListener();
  process.exitCode = 0;
});

module.exports.startStream = startStream;
module.exports.shutdownStreams = stop;
module.exports.startOscListener = startOscListener
module.exports.stopOscListener = stopOscListener