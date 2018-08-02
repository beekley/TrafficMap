/**
 * @description This process gathers transit duration data
 */
const params = require('./params');
const fs = require('fs');
const googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyCFHfxbYk2N5nMKFCQl4ZYlW0W3MydfP7g',
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
 * @description Calculates the duration for a given request
 * @param {Object} request
 * @return {Object}
 */
const getTransitData = request => new Promise((resolve, reject) => {
  googleMapsClient.directions(request, (error, response) => {
    if (error) return reject({ response, error });
    const duration = response.json.routes[0].legs[0].duration.value;
    resolve(duration);
  });
});

const path = `./output/${Date.now()}.json`;
const grid = generateGrid(params);
const output = {
  params,
  grid,
};
fs.writeFile(path, JSON.stringify(output, null, 2), { flag: 'wx' }, console.log);

const request = {
  origin: grid[0][0].location,
  destination: params.destinations[0].destination,
};
getTransitData(request).then(console.log).catch(console.log);
