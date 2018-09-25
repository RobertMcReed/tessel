const Tessel = require('tessel-io');
const five = require('johnny-five');

const { info } = require('./util');
const SoilHandler = require('./handler');

const run = (configuration) => {
  const soilHandler = new SoilHandler(configuration);

  const board = new five.Board({
    io: new Tessel(),
  });

  info('Starting project...');
  soilHandler.reportConfig();

  board.on('ready', () => {
    info('Board ready...');
    const soilSensor = new five.Sensor('a7');

    // set avg/min/max every X seconds and report status
    soilHandler.beginPolling();

    soilSensor.on('change', () => {
      const { value } = soilSensor;

      // add to running avg and min/max
      soilHandler.setIntervalValues(value);
    });
  });
};

module.exports = { run };
