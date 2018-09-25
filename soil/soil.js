const Tessel = require('tessel-io');
const five = require('johnny-five');

const { info } = require('./util');
const SoilHandler = require('./soil-handler');

const soilHandler = new SoilHandler();
const board = new five.Board({
  io: new Tessel(),
});


info('Starting project...');

board.on('ready', () => {
  info('Board ready...');
  const soilSensor = new five.Sensor('a7');

  // set lastAvg every X seconds and report status
  soilHandler.beginPolling();

  soilSensor.on('change', () => {
    const { value } = soilSensor;

    // add to running avg for interval
    soilHandler.setNewAvg(value);
  });
});
