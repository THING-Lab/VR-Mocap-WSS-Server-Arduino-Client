import express from 'express';
import WebSocket from 'ws';
const http = require('http');

// const qtmParser = require('./src/qualisys/QualisysParser.js');
// qtmParser();

const app = express();
var bodyParser = require('body-parser'); 

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/'));

const server_port = 5000;
const wsserver_port = 80;

var delim = "@";
var wemos_uuid = new Object();

var wemos_uuid_qtm = new Object();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

app.get('/', (req, res) => {
  res.send('Hello World!')
  console.log("[GET] /")
});

app.get('/devices', function(req, res) {
    res.render('pages/setup',{
      title: "Connected devices to server",
      wemos_uuid: wemos_uuid,
      wemos_uuid_qtm: wemos_uuid_qtm
    })
  });

app.post('/heartbeat', (req, res) => {
    console.log("[POST] Request");
    //console.log(req);
    res.status(200);
    res.send();
  });


app.post('/updateDevice', (req, res) => {
    console.log("[POST] Request");
    console.log(req.body.uuid);
    var req_uuid = req.body.uuid;
    var req_qtm_id = req.body.value;

    if(!(typeof req_uuid === 'undefined')){
      res.status(200);
      if(req_qtm_id === ""){
        if(req_uuid in wemos_uuid_qtm){
          delete wemos_uuid_qtm[req_uuid];
          res.send("Deleted!!!");
        }else{
        res.status(400);
        res.send("Failed!!!");
        }
      }else{
        wemos_uuid_qtm[req_uuid]= req_qtm_id;
        res.send("Updated!!!");
      }
    }else{
      res.status(400);
      res.send("Failed!!!");
    }
  });


app.get('/heartbeat', (req, res) => {
    console.log("[GET] Request");
    //console.log(req);
    res.status(200);
    res.send();
});
app.listen(server_port, '0.0.0.0', function() {
    console.info('Server running on port: ' + server_port);
});

const wss = new WebSocket.Server({ port: wsserver_port });
wss.on('connection', function(clientSocket) {
  //clientSocket.send('Connected to server');
  console.log('connected to client: ' + JSON.stringify(clientSocket._socket.address()));

  clientSocket.on('message', function incoming(message) {
    console.log('received: %s', message);
    console.log("calling parse");
    parseMessage(message, clientSocket);
  });

  clientSocket.on('ping', function incoming(message) {
    console.log('Ping received: %s', message);
    clientSocket.pong()
  });
  clientSocket.on('pong',function(message) { 
    console.log(clientSocket.id+' receive a pong : '+message); });
});

wss.on('error', function(clientSocket) {
  //clientSocket.send('Connected to server');
  console.log('Error occurrect to client: ' + JSON.stringify(clientSocket));
});



function parseMessage(message, clientSocket) {
  if (message != null && message.length>0){
    var arr = message.split(delim);
    if (arr.length >= 2){
      switch(arr[0]){
        case "NEGOTIATE":
          var uuid = "";
          if(arr[1] in wemos_uuid){
            uuid = wemos_uuid[arr[1]];
          }else{
            uuid = generate();
            wemos_uuid[arr[1]] = uuid;
          }
          console.log("Sending a uuid: "+ uuid+ " to: " + JSON.stringify(clientSocket._socket.address()))
          clientSocket.send("UUID@"+uuid);
          break;
          case "EVENT":
            console.log("Click event received");
            break;
      }
    }
    else{
      console.log("received array length less 2 can't process");
    }
  }
}

var ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

var ID_LENGTH = 8;

var generate = function() {
  var rtn = '';
  for (var i = 0; i < ID_LENGTH; i++) {
    rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
  }
  return rtn;
}

module.exports.wsserver = wss;