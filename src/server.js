/**
 * @description This process gathers transit duration data
 */
const params = require('./params');
const secrets = require('./secrets');
const fs = require('fs');
const updateJsonFile = require('update-json-file');
const googleMapsClient = require('@google/maps').createClient({
  key: secrets.gmapkey,
  Promise: Promise,
  rate: {limit: 50},
});

/**
 * @description Generate a grid of latLong
 * 0,0 represents NW corner
 * @param {Object} params
 * @return {Object[]}
 */
const generateGrid = params => {
  // Calcualte lat and long step sizes
  const latStep = ( params.NW.lat - params.SE.lat ) / (params.steps - 1);
  const lngStep = ( params.NW.lng - params.SE.lng ) / (params.steps - 1);
  // Create output grid
  const grid = [];
  // Create rows (lat)
  for (let r = 0; r < params.steps; r += 1) {
    const row = [];
    // Create cols (lng)
    for (let c = 0; c < params.steps; c += 1) {
      // Create gridpoint
      const lat = params.SE.lat + latStep * r;
      const lng = params.SE.lng + lngStep * c;
      const gridPoint = {
        location: { lat, lng },
        row: r,
        col: c,
      };
      row.push(gridPoint);
    }
    grid.push(row);
  }
  return grid;
};

/**
 * @description Calculate the duration for a given request
 * Documentation: https://developers.google.com/maps/documentation/directions/intro
 * @param {Object} request
 * @return {Object}
 */
const getTransitData = async request => {
  const response = await googleMapsClient.directions(request).asPromise();
  const duration = response.json.routes[0].legs[0].duration.value;
  return duration;
};

/**
 * @description Get the next uncalculated gridpoint
 * @param {Object[]} grid
 * @return {Object} reference to the gridpoint, or false if none found
 */
const findNextGridPoint = grid => {
  // Iterate through rows
  for (let r = 0; r < grid.length; r += 1) {
    // Iterate through cols
    for (let c = 0; c < grid[r].length; c += 1) {
      // If no duration, return object
      if (!grid[r][c].duration) return grid[r][c];
    }
  }
  return false;
};

/**
 * @description Populate the grid with weights
 * @param {Object[]} grid
 * @param {Object} destination
 * @param {String} path
 * @param {Number} delayMs
 * @return {Object} Nothing of significance
 */
const gatherData = async (grid, destination, path, delayMs = params.delay) => {
  // Attempt to gather data, otherwise retry
  try {
    const gridPoint = findNextGridPoint(grid);
    if (!gridPoint) return console.log(createContourOutput(grid));
    const request = {
      origin: gridPoint.location,
      destination: destination.destination,
      departure_time: 1533740400,
      mode: destination.mode,
    };
    const duration = await getTransitData(request);
    gridPoint.duration = duration;
    console.log(gridPoint);
    updateJsonFile(path, data => {
      data.grid[gridPoint.row][gridPoint.col] = gridPoint;
      return data;
    });
    // If successful, reset delay amount
    delayMs = params.delay;
  }
  catch (error) {
    console.error(error);
    delayMs += params.delay;
  }
  await delay(delayMs);
  gatherData(grid, destination, path, delayMs);
};

/**
 * @description Creates a string for use in http://contourmapcreator.urgr8.ch/
 * @param {Object} grid
 * @return {String}
 */
const createContourOutput = grid => grid
  .map(row => row
    .map(point => point.duration / 60)
    .join('	')
  ).join('\n');

/**
 * @description Helper function to delay a set amount of time
 * @param {Number} ms
 * @return {Promise}
 */
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Start process
 */
if (process.argv[2]) {
  const path = process.argv[2];
  updateJsonFile(path, data => {
    const destination = data.params.destinations[1];
    const grid = data.grid;
    try {
      gatherData(grid, destination, path);
    }
    catch (error) {
      console.log(error);
    }
    return data;
  });
}
else {
  const destination = params.destinations[0];
  const path = `./output/${Date.now()}-${destination.name}.json`;
  const grid = generateGrid(params);
  const output = {
    params,
    grid,
  };
  fs.writeFile(path, JSON.stringify(output, null, 2), { flag: 'wx' }, error => {
    if (error) return console.log(error);
    console.log('Created file at path:', path);
    try {
      gatherData(grid, destination, path);
    }
    catch (error) {
      console.log(error);
    }
  });
}
