# Introduction

The repository contains a node js based server which streams the Qualisys-RT feed on a WebSocket. On the same WebSocket, the server streams messages received from the connected ESP8266 devices. The server also exposes HTTP endpoints to set up the whole configuration and load all these data in an A-frame based application.


# Installation

Install Node.js® and NPM (Node Package Manager).

For mac users, the easiest way is to use install using homebrew:-

 $ brew install node

For Ubuntu users, simply use apt.

 $ sudo apt install nodejs

Install the dependencies using $ npm

 $ npm install

Install the wemos esp8266 drivers and Arduino from here: 
 $ https://wiki.wemos.cc/tutorials:get_started:get_started_in_arduino 
 $ https://github.com/esp8266/Arduino 

Flash the esp8266 with the latest code. 
1. Load the file [wemos-client](./wemos/wemos-client/wemos-client.ino) in your Arduino IDE.
2. Change the SERVERIPADDR variable to the IP address of the Node js server.
3. Change the SSID and pass to your wifi's SSID and Password.
4. Select the right port in Arduino which is connected to the device.
5. Click on upload and you are all set.

# Startup
To start the server

 $ npm start
This starts the node js server on port $ 5000

The server listens on all interfaces, so you can access it through the IP address of the machine. (In case you are not able to access it through the machine's IP address, check your firewall settings.)

Wemos:
As soon as the wemos comes up, it tries to register itself on the Node js server. If your server is started and wemos is flashed correctly you should see the connection information from wemos on your server's console.

# Usage
## Setup

1. Configure all the rigid bodies in QTM. 
2. Open the home page by going to http://localhost:5000/ or http://your-server-ipaddress:5000. Navigate to the setup page.
3. If your wemos device is connected you should see the device in the table. 
4. Edit the 'QTM Mapping' field in the table to be same as the deice name configured in QTM 6DOF rigid bodies. 
NOTE: It is very important to prefix the rigid body name with '/qtm/6d_euler/'. [Example](https://i.imgur.com/iiOS9Ls.png) 
These mappings are saved in the local storage in the data directory. The file names are defined in [Config](./config/ServerConfig.js) 
5. Click on Start streaming to start the stream. 
NOTE: You need to start the QTM real-time streaming before clicking on the start streaming button. Things may not work if you don't do that. Why? The start streaming button sends a UDP message to the QTM server which says to start streaming the 6d_eulers of the configured rigid bodies. 
6. To stop stream click on stop stream. 
NOTE: You must stop stream before shutting down the node js server if you don't do that the QTM application will continuously be sending the streams. (As it's all UDP) 

## Streaming
1. Once you start streaming(Don't try to start the stream if it's already streaming). If you don't see the results, click stop and then start again. 
2. Navigate to the home page of the server on your VR-Headset or your browser. 
3. Wait for 5 seconds for the application to load all the devices which are currently being streamed. The page updates every 5 seconds. 
4. Click on your headset, this will navigate you to the scene. 
5. The selected headset becomes your camera, so make sure you select the correct headset. 
[Example](https://i.imgur.com/BJ0tWVw.png) 


# Architecture
[See architecture](./ARCHITECTURE.md)
