# Introduction

The repository contains a node js based server which streams the Qualisys-RT feed on a websocket. On the same websocket the server streams messages received from the connected ESP8266 devices. The server also exposes HTTP endpoints to setup the whole configuration and load all these data in a A-frame based application.


# Installation

Install Node.js® and NPM (Node Package Manager).

For mac users, the easiest way is to use install using homebrew:-

    $ brew install node

For ubuntu users, simply use apt.

    $ sudo apt install nodejs

# Usage
## Configuring the server.
The server by default 

The Http endpoint is used to map the connected device Rigid body name (the name which Mocap server uses to stream data) to the Arduino.

This server also exposes another WebSocket port on which clients(A-frame) are connected. The server streams the position(sent by mocap), events(sent by Arduino) on this channel to all the connected client.
The client can then take decision base on those events.

Configuration:

Open the server.conf file.
Set the mocap_server address.

Start the server:
npm install
npm start

[Wemos - setup]
Open the wemos/wemos-client.ino file, update the node js server address and the ssid's.

Deploy the code on the wemos device.
