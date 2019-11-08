var osc = require("osc");

const QTMServerAddress = '127.0.0.1';
const QTM_RT_OSC_PORT = 22225; //base +4 port :xD
var udpPortClinet = null;
var udpPortServer = null;
//default listener port
var QTM_RT_OSC_LISTENER_PORT = 31004;

//returns the client. Use it to subscribe to other components.
const startStream = (components, qtmServerAddr = QTMServerAddress) => {
  QTMServerAddress = qtmServerAddr;
  udpPortClinet = new osc.UDPPort({
        localAddress: QTMServerAddress,
        localPort: 54663,
        metadata: true
      });

      udpPortClinet.on("message", function (oscMsg, timeTag, info) {
        console.log("[OSC Client] An OSC message just arrived!", oscMsg);
        console.log("[OSC Client] Remote info is: ", info);
      });

      // Open the socket.
      udpPortClinet.open();
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

const stopStream = () => {
  if(udpPortClinet != null){
    shutdownStreams();
  }
};

const shutdownStreams = () => {
    try{
        if(udpPortClinet != null){
          console.log("[OSC Client] Sending stutdown command.")
          udpPortClinet.send({
            address: "/qtm",
            args: [
                {
                    type: "s",
                    value: "disconnect Stop"
                }
            ]
          }, QTMServer, QTM_RT_OSC_PORT);
          udpPortClinet.close();
      } 
    }catch(err){
        console.log(err);
    }
}

//Gracefully shut down the streams? why not? duhh
process.on('SIGINT', (signal) => {
    console.log("[osc-qtm] " + signal + ' signal received.');
    shutdownStreams();
    stopOscListener();
    process.exitCode = 0;
});

process.on('exit', (signal) => {
    console.log("[osc-qtm] " + signal + ' signal received.');
    shutdownStreams();
    stopOscListener();
    process.exitCode = 0;
});

const startOscListener = (LISTENER_PORT=QTM_RT_OSC_LISTENER_PORT) =>{
  QTM_RT_OSC_LISTENER_PORT = LISTENER_PORT;
  udpPortServer = new osc.UDPPort({
    localAddress:'127.0.0.1',
    localPort: LISTENER_PORT
  });
  udpPortServer.on("ready", function () {  
    console.log("Listening for OSC over UDP.");
  });
  
  udpPortServer.on("message", function (oscMessage) {
    console.log("[OSC Server]" + JSON.parse(oscMessage));
    console.log(oscMessage);
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

module.exports.startStream = startStream;
module.exports.stopStream = stopStream;
module.exports.startOscListener = startOscListener
module.exports.stopOscListener = stopOscListener