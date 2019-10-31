const { Client } = require('node-osc');
import QTM_RT_OSC_LISTENER_PORT from './Osc-Rt-Udp-Listener'
import { constants } from 'perf_hooks';

const QTMServer = '127.0.0.1';
const QTM_RT_OSC_PORT = 22225; //base +4 port :xD

const client = new Client(QTMServer, QTM_RT_OSC_PORT);

const startStream = (componets) => {
    client.send('/qtm', '/connect', QTM_RT_OSC_LISTENER_PORT, (err) => {
        console.log(err);
      });

      client.send('/qtm', 'qtmversion', (err) => {
        console.log(err);
      });
    
      //use components here for a generic implementation.
      client.send('/qtm', 'StreamFrames', 'AllFrames', '6d', (err) => {
        console.log(err);
      });
};

const stopStream = (componets) => {
    client.send('/qtm', '/connect', QTM_RT_OSC_LISTENER_PORT, (err) => {
        console.log(err);
      });

      client.send('/qtm', 'qtmversion', (err) => {
        console.log(err);
      });
    
      //use components here for a generic implementation.
      client.send('/qtm', 'StreamFrames', 'AllFrames', '6d', (err) => {
        console.log(err);
      });
      shutdownStreams();
};

const shutdownStreams = () => {
    try{
        client.send('/qtm', 'StreamFrames', 'Stop', (err) => {
            console.log(err);
        });
        client.send('/qtm', 'disconnect', 'Stop', (err) => {
            console.log(err);
        });
        client.close();
    }catch(err){
        constants.log(err);
    }
}

//Gracefully shut down the streams? why not? duhh
process.on('SIGINT', (signal) => {
    console.log(signal + ' signal received.');
    shutdownStreams();
    process.exitCode = 0;
});

process.on('exit', (signal) => {
    console.log(signal + ' signal received.');
    shutdownStreams();
    process.exitCode = 0;
});

module.exports.startStream = startStream;
module.exports.stopStream = stopStream;