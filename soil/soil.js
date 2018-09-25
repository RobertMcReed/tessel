const Tessel = require('tessel-io');
const five = require('johnny-five');

const { info } = require('./util');
const SoilHandler = require('./handler');

const soilHandler = new SoilHandler({
  plantId: 10,
  delayInSecs: 30,
  normalize: true,
  sensorMin: 450,
  sensorMax: undefined,
  threshold: undefined,
});

const board = new five.Board({
  io: new Tessel(),
});

info('Starting project...');
soilHandler.reportConfig();

board.on('ready', () => {
  info('Board ready...');
  const soilSensor = new five.Sensor('a7');

  // set lastAvg every X seconds and report status
  soilHandler.beginPolling();

  soilSensor.on('change', () => {
    const { value } = soilSensor;

    // add to running avg and min/max
    soilHandler.setIntervalValues(value);
  });
});
