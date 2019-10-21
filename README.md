The repository contains a node js server which exposes an HTTP endpoint as well as WebSocket ports.

The Http endpoint is used to map the connected device Rigid body name (the name which Mocap server uses to stream data) to the Arduino.

This server also exposes another WebSocket port on which clients(A-frame) are connected. The server streams the position(sent by mocap), events(sent by Arduino) on this channel to all the connected client.
The client can then take decision base on those events.
