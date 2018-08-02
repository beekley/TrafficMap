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
 * @param {Object} request
 * @return {Object}
 */
const getTransitData = async request => {
  console.log(request);
  const response = await googleMapsClient.directions(request).asPromise();
  console.log(response);
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
 */
const gatherData = async (grid, destination, path) => {
  // Attempt to gather data, otherwise retry
  try {
    const gridPoint = findNextGridPoint(grid);
    const request = {
      origin: gridPoint.location,
      destination: destination.destination,
    };
    const duration = await getTransitData(request);
    gridPoint.duration = duration;
    console.log(gridPoint);
    updateJsonFile(path, data => {
      data.grid[gridPoint.row][gridPoint.col] = gridPoint;
      return data;
    });
  }
  catch (error) {
    console.error(error);
  }
  await delay(1000);
  gatherData(grid, destination, path);
};

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
  const destination = params.destinations[1];
  updateJsonFile(path, data => {
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
  const destination = params.destinations[1];
  const path = `./output/${Date.now()}-${destination.name}.json`;
  const grid = generateGrid(params);
  const output = {
    params,
    grid,
  };
  fs.writeFile(path, JSON.stringify(output, null, 2), { flag: 'wx' }, error => {
    if (error) return console.log(error);
    try {
      gatherData(grid, destination, path);
    }
    catch (error) {
      console.log(error);
    }
  });
}
