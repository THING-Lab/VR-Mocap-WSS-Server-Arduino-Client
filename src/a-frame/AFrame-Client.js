const CONNECTION_LOST = "Connection lost...Reconnecting in 5 seconds.";
var socket = null;
var socketClosed = true;

const getRigidBodyName = rigidBody => {
  var s = rigidBody.split("/");
  if (s.length == 0) return "";
  return s[s.length - 1];
};

const extractPosition = data => {
  const euler = data["args"];
  var pos = `${euler[0].value / 50} ${euler[1].value / 50} ${euler[2].value /
    50}`;
  return pos;
};

const createBrush = (id, color, position) => {
  var scene = document.querySelector("a-scene");
  var box = document.createElement("a-box");
  box.setAttribute("position", position);
  box.setAttribute("color", color);
  box.setAttribute("height", "6.5");
  box.setAttribute("width", "4");
  box.setAttribute("depth", "1.75");
  box.setAttribute("id", id);
  // box.setAttribute('src', '#netTexture');
  scene.appendChild(box);
  return box;
};
const connected_devices = {};
const objects_in_scene = {};
const SIX_D_EULER = "6d_euler";
const WEMOS = "wemos";
const ADDRESS = "address";

const fake_connected = {
  asdsad: {
    connected: true,
    last_seen: new Date().toLocaleString()
  },
  asaslkdjaslkdsad: {
    connected: true,
    last_seen: new Date().toLocaleString()
  },
  "asda;slkd;laskdsad": {
    connected: true,
    last_seen: new Date().toLocaleString()
  }
};

const fakeTest = () => {
  updateOnlineDevices(fake_connected);
};

const collectOnlineDevices = data => {
  if (data == null || data == undefined) {
    return;
  }
  if (SIX_D_EULER in data) {
    /**
     * Data format:
     * {"address":"/qtm/6d_euler/my_brush","args":[{"type":"f","value":3340.053955078125},
     * {"type":"f","value":2429.1494140625},{"type":"f","value":636.8633422851562},{"type":"f","value":11.894165992736816},
     * {"type":"f","value":2.245436668395996},{"type":"f","value":33.33510208129883}],
     * "6deuler":true}
     */
    //Store the which all device is connected
    if (data[ADDRESS].includes(SIX_D_EULER)) {
      //can optimize
      connected_devices[data[ADDRESS]] = {
        connected: true,
        last_seen: new Date().toLocaleString()
      };
    }
  }
};

var my_headset = "";

const init = () => {
  my_headset = getParameterByName("my_headset", window.location.href);
  console.log("Headset set to :", my_headset);
};

const getParameterByName = (name, url) => {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

const main = data => {
  if (data == null || data == undefined) {
    return;
  }
  if (SIX_D_EULER in data) {
    /**
     * Data format:
     * {"address":"/qtm/6d_euler/my_brush","args":[{"type":"f","value":3340.053955078125},{"type":"f","value":2429.1494140625},{"type":"f","value":636.8633422851562},{"type":"f","value":11.894165992736816},{"type":"f","value":2.245436668395996},{"type":"f","value":33.33510208129883}],"6deuler":true}
     */
    if (data[ADDRESS] == my_headset) {
      //set the camera position according to the current selected device.
    } else {
      //set the position of the brush.
      if (data[ADDRESS] in objects_in_scene) {
        objects_in_scene[data[ADDRESS]].setAttribute(
          "position",
          extractPosition(data)
        );
      } else {
        //lets create one---just make sure we don't create camera object but do we
        //need to create other DEVICES if want to do so what shape will those have?
        console.log("Added to the scene:", data[ADDRESS]);
        var brush = createBrush(data[ADDRESS], "red", extractPosition(data));
        objects_in_scene[data[ADDRESS]] = brush;
      }
    }
  } else if (WEMOS in data) {
    /**
     * Data format:
     * {"id":"u45yU5Kv","click":false,"qid":"/qtm/6d_euler/my_brush","wemos":true}
     */
    //Event from a wemos received, change the color of the box.
    console.log("WEMOS in data....");
    if (data["qid"] in objects_in_scene) {
      console.log("Changing color for the object:", data["qid"]);
      if (data["click"]) {
        objects_in_scene[data["qid"]].setAttribute("color", "blue");
      } else {
        objects_in_scene[data["qid"]].setAttribute("color", "red");
      }
    }
  } else {
    console.log("[ERROR] - OSC message not supported.");
  }
};

const startListening = (callBackOnMessage = null) => {
  if (socket == null || socket == undefined || socketClosed) {
    socket = new WebSocket("ws://192.168.1.100:44523");
  }
  // Connection opened
  socket.addEventListener("open", function(event) {
    // socket.send('Hello Server!');
    socketClosed = false;
    console.log("connection was open... ");
  });
  // Listen for messages
  socket.addEventListener("message", function(event) {
    if (callBackOnMessage != null) {
      callBackOnMessage(JSON.parse(event.data));
    } else {
      console.log("Message from server ", event.data);
    }
  });

  socket.addEventListener("close", event => {
    socketClosed = true;
    console.error(CONNECTION_LOST, event);
    setTimeout(function() {
      startListening(callBackOnMessage);
    }, 5000);
  });
};

const stopListening = () => {
  if (socket) {
    try {
      socket.close();
    } catch (err) {
      console.log("WS - Socket closed.");
    }
  }
};

const wsMessageParser = message => {
  if (message) {
    try {
      if (message["6deuler"] || message["wemos"]) {
        return message;
      } else {
        console.log("don't know the message type.");
        return null;
      }
    } catch (err) {
      console.log("wsMessageParser. Error in reading message. ");
    }
  }
};

const updateOnlineDevices = devices => {
  var list = '<li class="list-group-item active">Online devices</li>';
  if (devices) {
    for (var device in devices) {
      if (devices.hasOwnProperty(device)) {
        list +=
          '<a href="/preview?my_headset=' +
          device +
          '" class="list-group-item list-group-item-action">' +
          device +
          "   Last seen: " +
          devices[device].last_seen +
          "</a>";
      }
    }
    document.getElementById("online_devices").innerHTML = list;
  }
};
