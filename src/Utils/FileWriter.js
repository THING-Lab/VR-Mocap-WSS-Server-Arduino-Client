const fs = require("fs");

const path = __dirname + "/../../data/";

var writeToDisk = function(
  wemos_uuid_file,
  wemos_uuid,
  wemos_uuid_qtm_file,
  wemos_uuid_qtm
) {
  try {
    console.log("Writing to disk Path: " + path);
    fs.writeFile(
      path + wemos_uuid_file,
      JSON.stringify(wemos_uuid),
      "utf-8",
      function(err, result) {
        if (err) console.log("error", err);
      }
    );
    fs.writeFile(
      path + wemos_uuid_qtm_file,
      JSON.stringify(wemos_uuid_qtm),
      "utf-8",
      function(err, result) {
        if (err) console.log("error", err);
      }
    );
  } catch (error) {
    console.log("Error occurred in friting to disk: " + error);
  }
};

var readFromDisk = function(wemos_uuid_file, wemos_uuid_qtm_file) {
  var wemos_uuid = null;
  var wemos_uuid_qtm = null;
  try {
    wemos_uuid = fs.readFileSync(path + wemos_uuid_file, "utf-8");
  } catch (err) {
    console.error("Error reading file wemos_uuid", err);
    wemos_uuid = new Object();
  }
  try {
    wemos_uuid_qtm = fs.readFileSync(path + wemos_uuid_qtm_file, "utf-8");
  } catch (err) {
    console.error("Error reading file wemos_uuid_qtm", err);
    wemos_uuid_qtm = new Object();
  }
  return [JSON.parse(wemos_uuid), JSON.parse(wemos_uuid_qtm)];
};

module.exports.writeToDisk = writeToDisk;
module.exports.readFromDisk = readFromDisk;
