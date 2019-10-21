#include <Arduino.h>

#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>

#include <WebSocketsClient.h>

#include <Hash.h>

ESP8266WiFiMulti WiFiMulti;
WebSocketsClient webSocket;

// ping server every 6000 ms
// expect pong from server within 3000 ms
// consider connection disconnected if pong is not received 3 times
uint32_t PING_INTERVAL = 20000;
uint32_t PONG_TIMEOUT = 6000;
uint8_t disconnectTimeoutCount = 3;
String mac = WiFi.macAddress();
String host = WiFi.hostname();
String WEMOS_ID = "#" + mac + "#" + host;
String SERVERIPADDR = "192.168.1.4";
uint16_t WS_SERVERPORT = 80;
String ssid = "Get_Your_Own";
String pass = "newton264$$";

String heartBeatEP = SERVERIPADDR+"heartbeat";
String delim = "@";
String NEGOTIATE_REQ = "NEGOTIATE" + delim +WEMOS_ID;
String UUID = "";

const long timeout = 10000;
long t0;

/* [Format]
 * CLICK_EVENT:UUID
 * We can add timestamp in future.
 * Server will send the UUID after negotitate
*/
String DEFAULT_CLICK_EVENT_REQ = "EVENT" +delim;
//Initially set to default, will be updated after negotiatel
String CLICK_EVENT_REQ = DEFAULT_CLICK_EVENT_REQ;

#define D8INP 15

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  Serial.printf("[WSc] Looping..!\n");

  switch(type) {
    case WStype_DISCONNECTED:
      Serial.printf("[WSc] Disconnected!\n");
      break;
    case WStype_CONNECTED: {
      Serial.printf("[WSc] Connected to url: %s\n", payload);
      // send message to server when Connected
      negotiate();
    }
      break;
    case WStype_TEXT:
      Serial.printf("[WSc] get text: %s\n", payload);
      parse_payload(payload);
      // send message to server
      // webSocket.sendTXT("message here");
      break;
    case WStype_BIN:
      Serial.printf("[WSc] get binary length: %u\n", length);
      hexdump(payload, length);

      // send data to server
      // webSocket.sendBIN(payload, length);
      break;
        case WStype_PING:
            // pong will be send automatically
            Serial.printf("[WSc] get ping\n");
            break;
        case WStype_PONG:
            // answer to a ping we send
            Serial.printf("[WSc] get pong\n");
            break;
         default:
            Serial.printf("[WSc] default type message\n");

    }

}

void negotiate(){
   webSocket.sendTXT(NEGOTIATE_REQ);
}
void parse_payload(uint8_t * payload){
  
 char * str = (char *)payload; 
 char* token = strtok(str, "@");
 if(token != NULL){
  Serial.println("[Parse_payload] Received token: " + String(token));
    if(String(token).equalsIgnoreCase("UUID")){
        UUID = String(strtok(NULL, ""));
        Serial.println("UUID received: " + UUID);
        CLICK_EVENT_REQ = DEFAULT_CLICK_EVENT_REQ + UUID;
        Serial.println("[Parse_payload] CLICK_EVENT_REQ: " + CLICK_EVENT_REQ);
      }
  }
}

void setup_ids(){
  while(UUID.equals("")){
    webSocket.loop();
  }
}

void handle_click(){

  if(digitalRead(D8INP)){
//    webSocket.sendBIN(const uint8_t * payload, size_t length);.  
   webSocket.sendTXT(CLICK_EVENT_REQ);
  }
  else{
    if((millis() - t0 ) > timeout){
      t0 = millis();
      Serial.printf("[handle_click] Pin not set Sending clickevent...\n");
      webSocket.sendTXT(CLICK_EVENT_REQ);
    }
  }
}



void setup() {
  // Serial.begin(921600);
  Serial.begin(115200);

  //Serial.setDebugOutput(true);
  Serial.setDebugOutput(true);

  Serial.println();
  Serial.println();
  Serial.println();

  for(uint8_t t = 4; t > 0; t--) {
    Serial.printf("[SETUP] BOOT WAIT %d...\n", t);
    Serial.flush();
    delay(1000);
  }
  pinMode(D8INP, INPUT);
  Serial.printf("Pin %d set as INPUT pin", D8INP);
  
  WiFi.mode(WIFI_STA);
  WiFiMulti.addAP("The Grid", "BeamMeIn");


  //WiFi.disconnect();
  while(WiFiMulti.run() != WL_CONNECTED) {
    delay(100);
  }
  Serial.printf("Connected to WiFi");
  // server address, port and URL
  webSocket.begin(SERVERIPADDR, WS_SERVERPORT, "/");

  // event handler
  webSocket.onEvent(webSocketEvent);

  // try ever 5000 again if connection has failed
  webSocket.setReconnectInterval(5000);
  
  // start heartbeat
  webSocket.enableHeartbeat(PING_INTERVAL, PONG_TIMEOUT, disconnectTimeoutCount);

  setup_ids();
  Serial.printf("Setup Complete...\n");
  t0 = millis();
}

void loop() {
  if ((WiFiMulti.run() == WL_CONNECTED)) {
    handle_click();
    webSocket.loop();
  }
  
}
