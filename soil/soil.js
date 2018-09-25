const Tessel = require('tessel-io');
const five = require('johnny-five');

const { info } = require('./util');
const SoilHandler = require('./soil-handler');

const board = new five.Board({
  io: new Tessel(),
});

const soilHandler = new SoilHandler();

info('Starting project...');

board.on('ready', () => {
  info('Board ready...');
  const soil = new five.Sensor('a7');

  // set lastAvg every X seconds and report status
  soilHandler.beginPolling();

  soil.on('change', () => {
    const { value } = soil;

    // add to running avg for interval
    soilHandler.setNewAvg(value);
  });
});
