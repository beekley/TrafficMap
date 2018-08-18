/**
 * @description This script merges one or more output files
 * Throws errors if the array sizes do not match
 * Throws warnings if coordinates are not the same
 */
const fs = require('fs');
const [dont, care, ...paths] = process.argv;
const files = paths.map(path => require(`${__dirname}/../${path}`));

// Validate lengths
if (files.length === 0) throw new Error('Must provide at least one file path');
const sameLengths = files.reduce((valid, file) => valid && file.grid.length === files[0].grid.length, true);
if (!sameLengths) throw new Error('Not all grids have the same size');

const grid = files[0].grid
  // For each row in the grid...
  .map((row, r) => row
    // And each col in the row...
    .map((col, c) => files
      .map(file => file.grid)
      // Get the sum of all durations for the gridPoint
      .reduce((gridPoint, grid) => {
        gridPoint.duration = gridPoint.duration + grid[r][c].duration;
        return gridPoint;
      }, { duration: 0 })));

const output = {
  params: files[0].params,
  grid,
};

fs.writeFile('./output/test.json', JSON.stringify(output, null, 2), { flag: 'wx' }, error => {
  if (error) console.log(error);
});
