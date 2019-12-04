const CONNECTION_LOST = "Connection lost...Reconnecting in 5 seconds."
function init() {
  var cs = new WebSocket("wss://0.0.0.0:44523", "osc-v1");
  cs.onmessage = function(event) {
    console.log(event.data);
  };
  cs.onclose = function() {
    // Try to reconnect in 5 seconds
    console.error(CONNECTION_LOST);
    setTimeout(function() {
      init();
    }, 5000);
  };
}
