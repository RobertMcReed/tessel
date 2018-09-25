const autoBind = require('auto-bind');
const { info } = require('./util');

class SoilHandler {
  constructor({
    plantId,
    threshold,
    delayInSecs = 10,
    sensorMin = 0,
    sensorMax = 800,
    normalize = true,
    handleDry = () => {},
    handleWet = () => {},
  } = {}) {
    this.state = {
      avg: 0,
      max: 0,
      min: 0,
      status: 0,
      numReads: 0,
    };
    this.plantId = plantId;
    this.sensorMax = sensorMax;
    this.sensorMin = sensorMin;
    this.normalize = normalize;
    this.delayInSecs = delayInSecs;

    // handle of wet --> dry / dry --> wet events
    this.handleDry = handleDry;
    this.handleWet = handleWet;

    if (threshold) this.threshold = threshold;
    else this.threshold = (normalize ? 0.5 : 300);
    autoBind(this);
  }

  reportConfig() {
    const configuration = {
      plantId: this.plantId,
      threshold: this.threshold,
      sensorMin: this.sensorMin,
      sensorMax: this.sensorMax,
      normalize: this.normalize,
      delayInSecs: this.delayInSecs,
    };

    info('CONFIGURATION', JSON.stringify(configuration, null, 2));
  }

  normalizeValue(value) {
    if (!this.normalize) return value;

    const diff = this.sensorMax - this.sensorMin;

    // bring the value from ~ [sensorMin, sensorMax] to [0, 1]
    let normalized = (value - this.sensorMin) / diff;

    // if a value is below 0 set it to 0
    normalized = Math.max(0, normalized);

    // if a value is over 1 set it to 1
    normalized = Math.min(1, normalized);

    return normalized;
  }

  setState(obj) {
    const update = (typeof obj === 'function' ? obj(this.state) : obj);

    this.state = { ...this.state, ...update };
  }

  markStatus(status) {
    this.setState({ status });
  }

  markDry() {
    this.markStatus(0);
  }

  markWet() {
    this.markStatus(1);
  }

  isWet() {
    return (!!this.state.status);
  }

  isDry() {
    return (!this.state.status);
  }

  handleReport({ avg, min, max }) {
    // called at the end of each reporting interval

    if (avg < this.threshold && this.isWet()) {
      info('WET --> DRY');
      this.markDry();
      this.handleDry({ avg, min, max });
    } else if (avg > this.threshold && this.isDry()) {
      info('DRY --> WET');
      this.markWet();
      this.handleWet({ avg, min, max });
    }

    info(avg < this.threshold ? 'DRY' : 'WET');
    info('Interval Duration:', `${this.delayInSecs}s`);
    info('Interval Avg:', avg);
    info('Interval Max:', max);
    info('Interval Min:', min);
  }

  setIntervalValues(value) {
    const normalized = this.normalizeValue(value);

    if (!this.state.numReads) {
      this.setState({
        avg: normalized,
        min: normalized,
        max: normalized,
        numReads: 1,
      });
    } else {
      let { avg, numReads } = this.state;
      const { min, max } = this.state;

      const numerator = avg * numReads;

      numReads += 1;

      avg = (numerator + normalized) / numReads;

      this.setState({
        avg,
        numReads,
        max: Math.max(max, normalized),
        min: Math.min(min, normalized),
      });
    }
  }

  recordValue() {
    this.setState(({ avg, min, max }) => {
      this.handleReport({ avg, min, max });

      return {
        avg: 0,
        min: 0,
        max: 0,
        numReads: 0,
      };
    });
  }

  beginPolling() {
    this.intervalFn = setInterval(this.recordValue, this.delayInSecs * 1000);
  }
}

module.exports = SoilHandler;
