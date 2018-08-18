# Contour Traffic Map

Commuting can be a huge sink of time that living close to work can reclaim. This project aims to gather data for the estimated duration it takes to get to a destination.

The image below shows a visualization of the output of this project for a commute from Alhambra to parts of Culver City/West LA.

![Sample screenshot](https://i.imgur.com/gwId8R2.jpg)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine.

### Prerequisites

This project requires Node >8.

You must provide your own Google Maps API key, which you can get from the [Google developer console](https://console.developers.google.com/google/maps-apis/overview). I recommend enabling billing, since the rate limits without billing are too low for this project to be used practically.

### Installation

The first step is to clone the repository and install the dependencies.

```
git clone https://github.com/beekley/TrafficMap
cd TrafficMap
npm install
```

Next, create a file `src/secrets.js` with the following content:

```
module.exports = {
  gmapkey: 'your Google API key here!',
};
```

## Gathering and Visualizing Traffic Data

This project contains scripts for gathering traffic data using the Google Maps API and for aggregating multiple data runs. Visualization is done using an external tool, http://contourmapcreator.urgr8.ch/.

### To/from one destination

Set up the `src/params.js` file with the parameters of your test run.

```
{
  // Latitude and Longitude of the northwest corner of your data bounds
  NW: {
    lat: 34.064198628171205,
    lng: -118.46974367439054
  },
  // Latitude and Longitude of the southeast corner of your data bounds
  SE: {
    lat: 33.981282417908275,
    lng: -118.36352809359795
  },
  // 1-dimensional resolution
  steps: 30,
  // Delay between API calls-- increase this if you run into rate limits
  delay: 50,
  // Google Directions API options, with a few additional properties
  // Documentation: https://developers.google.com/maps/documentation/directions/intro
  request: {
    // Name of the data run
    name: 'drive-s37',
    // Data is gathered from the grid to the destination, or the reverse if set to `true`
    reverse: false,
    // API options
    destination: '12121 Bluff Creek Dr, Los Angeles, CA 90094',
    mode: 'driving',
    departure_time: 1533736800,
  },
}
```

The run the following command.

```
node src/server.js
```

A file will be created in the `output` directory with the naming structure `${startTimestamp}-${runName}`. Data organized for visualization will be logged to the console on completion.

A data run can be started and stopped at will. To restart a run, pass the path to the in-progress output file as the first CLI parameter.

### To/from multiple destinations

The `src/merge.js` script can combine the data from multiple data runs. To use it, pass the paths to each output file as a CLI parameter.

```
node src/merge.js path1 path2 path3
```

A file will be created at `output/test.json`. Running the main script on this merged file will print the data formatted for visualization.

TODO: Make the output of the merge script more informational/configurable.

### Visualizing data

An external tool can be used to visualize the data. First, navigate to http://contourmapcreator.urgr8.ch/. Next, enter the NW and SE coordinates from `src/params.js` into the fields on the page. Then copy the output from the data run into the `Elevation Data` field. Finally, hit `Redraw Contours`.
