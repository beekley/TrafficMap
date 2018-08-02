/**
 * @description This process gathers transit duration data
 */
const params = require('./params');

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

generateGrid(params).forEach(console.log)
