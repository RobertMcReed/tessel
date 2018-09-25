const fetch = require('node-fetch');

const soil = require('./soil');
const { info, err } = require('./util');

const PLANT_ID = 10;
const API_URL = 'https://api.concurlabs.com/waterlog/plants';

const main = async (plantId) => {
  info(`Fetching configuration file for plant ${plantId}`);

  try {
    const res = await fetch(`${API_URL}/${plantId}`);
    const { profile: { configuration } } = await res.json();

    soil.run(configuration);
  } catch (e) {
    err('Failed to fetch configuration');
    err(e);
  }
};

main(PLANT_ID);
