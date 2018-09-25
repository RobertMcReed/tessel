const autoBind = require('auto-bind');
const { info } = require('./util');

class SoilHandler {
  constructor({ threshold = 300, delayInSecs = 10 } = {}) {
    this.state = {
      avg: 0,
      status: 0,
      numReads: 0,
      lastAvg: null,
    };
    this.threshold = threshold;
    this.delayInSecs = delayInSecs;
    autoBind(this);
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

  handleStatus() {
    const { lastAvg } = this.state;

    if (lastAvg < this.threshold && this.isWet()) {
      info('WET --> DRY');
      this.markDry();
    } else if (lastAvg > this.threshold && this.isDry()) {
      info('DRY --> WET');
      this.markWet();
    }

    info(lastAvg < this.threshold ? 'WET' : 'DRY');
    info(`Avg over ${this.delayInSecs} seconds:`, lastAvg);
  }

  setNewAvg(value) {
    if (!this.state.numReads) this.setState({ avg: value, numReads: 1 });
    else {
      let { avg, numReads } = this.state;

      const numerator = avg * numReads;

      numReads += 1;

      avg = (numerator + value) / numReads;

      this.setState({ avg, numReads });
    }

    return this.state.avg;
  }

  recordValue() {
    this.setState(({ avg }) => ({
      avg: 0,
      numReads: 0,
      lastAvg: avg,
    }));

    this.handleStatus();
  }

  beginPolling() {
    this.intervalFn = setInterval(this.recordValue, this.delayInSecs * 1000);
  }
}

module.exports = SoilHandler;
