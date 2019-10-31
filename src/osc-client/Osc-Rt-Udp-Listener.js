var { Server } = require('node-osc');

const QTM_RT_OSC_LISTENER_PORT = 55334;

var listener = new Server(QTM_RT_OSC_LISTENER_PORT, '0.0.0.0');

//start streming the data received on the websocket channel to A-Frame connected devices.

//add a log in the emitter code to see what kind of messages the qtm server is sending. 
//Check the logs of decoder in node-osc impl.
const startOscListener = () =>{
  listener.on('message', function (msg) {
    console.log(`----Message: ${msg}`);
    
  });
  
}

const stopOscListener = () =>{
  listener.close();
}

module.exports.QTM_RT_OSC_LISTENER_PORT = QTM_RT_OSC_LISTENER_PORT
module.exports.startOscListener = startOscListener
module.exports.stopOscListener = stopOscListener