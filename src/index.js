// Parameters
const params = {
  center: {lat: 34.0261897, lng: -118.4115412},
  zoom: 14,
  steps: 2,
  stepSize: 0.005,
  delay: 500,
  destinations: [
    {
      address: '12121 Bluff Creek Dr #100, Los Angeles, CA 90094',
      travelMode: 'BICYCLING',
    },
  ],
};
let map = null;

/**
 * @description Google Maps API initialization function
 */
async function initMap() {
  const { center, zoom } = params;
  map = new google.maps.Map(document.getElementById('map'), {
    center,
    zoom,
  });
  await createHeatmap(map);
}

/**
 * @description create heatmap. NOTE: This is the only interface with `params`
 * @param {Object} map - Google Maps API map instance
 */
const createHeatmap = async map => {
  const coords = createCoords(params.steps, params.stepSize, params.center);
  const coordCount = coords.length;
  const data = new google.maps.MVCArray([]);
  refreshHeatmap(map, data);
  console.log(`Starting calculation for ${coordCount} locations.`);
  for (let i = 0; i < coordCount; i += 1) {
    const coord = coords[i];
    const destination = params.destinations[0];
    try {
      await delay(params.delay);
      coord.weight = await getTransitData(coord.location, destination.address, destination.travelMode);
    }
    catch (error) {
      console.log(error);
    }
    data.push(coord);
    console.log(`${i+1}/${coordCount}`);
  }
  console.log('Done.')
  console.log({data});
};

/**
 * @description Refreshes heatmap with new data. NOTE: This is the only interface with `params`
 * @param {Object} map - Google Maps API map instance
 * @param {Object} data - Google Maps API map instance
 */
const refreshHeatmap = (map, data) => new google.maps.visualization.HeatmapLayer({
  data,
  map,
  radius: 100,
  opacity: 0.4,
  maxIntensity: 3000,
});

/**
 * @description Create coord array
 * @param {Number} steps
 * @param {Number} stepSize
 * @param {Object} center - Location of the center of the map
 * @return {Object[]}
 */
const createCoords = (steps, stepSize, center) => {
  // Create array of coordinates
  const coords = [];
  // Iterate from -steps to steps
  for (let x = -steps; x <= steps; x += 1) {
    for (let y = -steps; y <= steps; y += 1) {
      const coord = {
        location: new google.maps.LatLng(
          center.lat + x * stepSize,
          center.lng + y * stepSize
        ),
      };
      coords.push(coord);
    }
  }
  return coords;
};


/**
 * @description Get data for a given coord
 * @param {Number} origin
 * @param {Number} destination
 * @param {Object} travelMode - Location of the center of the map
 * @param {Number} retryCount
 * @return {Object[]}
 */
const getTransitData = async (origin, destination, travelMode, retryCount = 0) => new Promise((resolve, reject) => {
  const request = {
    origin,
    destination,
    travelMode,
  };
  const directionsService = new google.maps.DirectionsService;
  directionsService.route(request, (response, status) => {
    if (status !== 'OK') return reject({ response, status });
    const duration = response.routes[0].legs[0].duration.value;
    resolve(duration);
  });
});

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
