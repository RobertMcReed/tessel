const util = module.exports = {};

util.info = (...args) => console.log('[INFO]', ...args);

util.err = (...args) => console.error('[ERROR]', ...args);
