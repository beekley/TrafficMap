// Parameters
const params = {
  center: {lat: 34.0261897, lng: -118.4115412},
  zoom: 14,
  steps: 4,
  stepSize: 0.0035,
  delay: 1000,
  destinations: [
    {
      address: '12121 Bluff Creek Dr #100, Los Angeles, CA 90094',
      travelMode: 'BICYCLING',
    },
    // {
    //   address: '5555 Valley Blvd, Los Angeles, CA 90032',
    //   travelMode: 'DRIVING',
    // },
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
  const destCount = params.destinations.length;
  const data = new google.maps.MVCArray([]);
  console.log(`Starting calculation for ${coordCount} locations and ${destCount} destinations.`);
  for (let i = 0; i < coordCount; i += 1) {
    const coord = coords[i];
    let sum = 0;
    for (let j = 0; j < destCount; j += 1) {
      const destination = params.destinations[j];
      try {
        await delay(params.delay);
        sum += await getTransitData(coord.location, destination.address, destination.travelMode);
      }
      catch (error) {
        console.log(error);
      }
      console.log(`${i+1}/${coordCount} - destination ${j+1}`);
    }
    coord.weight = sum;
    data.push(coord);
  }
  console.log('Done.');
  console.log({ originaldata: data });
  console.log('Normalizing.');
  normalizeData(data);
  console.log({ normalizedData: data });
  createHeatmapLayer(map, data);
};

/**
 * @description Mutates original array to set min to 0
 * @param {Object} data - weighted data array
 */
const normalizeData = data => {
  const min = Math.min(...data.getArray().map(datum => datum.weight));
  // const max = Math.max(data.map(datum => datum.weight));
  data.forEach((datum, i) => {
    datum.weight -= min;
    data.setAt(i, datum);
  });
};

/**
 * @description
 * @param {Object} map - Google Maps API map instance
 * @param {Object} data - weighted data array
 * @return {Object}
 */
const createHeatmapLayer = (map, data) => new google.maps.visualization.HeatmapLayer({
  data,
  map,
  radius: 70,
  opacity: 0.6,
  maxIntensity: 2000,
  // dissipating: true,
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
  const latLongRatio = 0.8;
  // Iterate from -steps to steps
  for (let x = -steps; x <= steps; x += 1) {
    for (let y = -steps; y <= steps; y += 1) {
      const coord = {
        location: new google.maps.LatLng(
          center.lat + x * stepSize * latLongRatio,
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
