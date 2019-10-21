const colors = require('colors')
const QTMrt = require('qualisys-rt');
const qtmReader = new QTMrt.Api();

function init(io) {
  io.on('connection', (socket) => {
    console.log(socket);
  });
  qtmReader.on('frame', function(data) {
    // console.log('Received frame:'.green);
    console.log(data)
    io.sockets.emit('frame',
      data.components['6dEuler'].rigidBodies.map(
        body => {
          return {
            x: body.x,
            y: body.y,
            z: body.z,
            xRot: body.euler1,
            yRot: body.euler2,
            zRot: body.euler3,
          }
        })
    );
  });
  
  qtmReader.on('end', function(data) {
    console.log('No more data!'.red);
  });
  
  qtmReader.on('event', function(event) {
    console.log(event.name.yellow);
  });
  
  qtmReader.on('disconnect', function(event) {
    process.exit();
  });


  qtmReader.connect()
    .then(function() { return qtmReader.qtmVersion(); })
    .then(function(version) { return qtmReader.byteOrder(); })
    .then(function(byteOrder) { return qtmReader.getState(); })
    .then(function() { return qtmReader.streamFrames({ frequency: 60, components: ['6DEuler'] }); })
}

module.exports = init;
