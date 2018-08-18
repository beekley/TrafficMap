// Constants
var destination1 = '607 Charles E Young Dr E, Los Angeles, CA 90095';
var destination2 = '3545 Long Beach Blvd, Long Beach, CA 90807';
var mode1 = 'TRANSIT';
var mode2 = 'TRANSIT';
var delay = 2500;

// Globally addressable vars
var map;
var origins = [];
var mapData = [];
var sliceCount = 0;

// Debuggins
var errorCount = 0;

function initMap() {

	var latMin = 33.80;
	var latMax = 34.10;
	var lngMin = -118.50;
	var lngMax = -118.05;
	var slices = 10;
	var slice = (latMax-latMin)/slices;


	// Create origins array
	for (var i = 0; i <= slices; i++) {
		for (var j = 0; lngMin + j*slice <= lngMax; j++) {

			origins[i + j*(slices+1)] = {lat: latMin + i*slice, lng: lngMin + j*slice};
			sliceCount++;

		}
	}

	console.log(sliceCount);

	calc(origins[0], destination1, mode1, 0, null);
}

function calc(origin, destination, travelMode, i, t1) {

	if (i == sliceCount) {
		buildMap(sumTimes(mapData));
		return;
	}

	var ll = origin.lat + ', ' + origin.lng;

	var request = {
		origin:ll,  //new google.maps.LatLng(origin.lat,origin.lng),
		destination:destination,
		travelMode:travelMode,
		transitOptions: {
			departureTime: new Date("2016-10-03T15:00:00")
	    },
		drivingOptions: {
			departureTime: new Date("2016-10-03T15:00:00"),
			trafficModel: 'bestguess'
		}
	};


	var directionsService = new google.maps.DirectionsService;
	directionsService.route(request, function(response, status) {
		console.log(i, status);

		if (status == 'OVER_QUERY_LIMIT') {
			errorCount++;
		}

		if (i < sliceCount) {

			if (status == 'OK') {

				// if this is the calc for second destination, then log results and go to next origin
				if (t1 != null) {
					var t2 =  response.routes[0].legs[0].duration.value;
					mapData[i] = {origin, t1, t2};

					setTimeout(function() {
						calc(origins[i+1], destination1, mode1, i+1, null);
					}, delay);

					//console.log()
				}

				// if this is the calc for the first destinatinon calc for second destination
				else {
					t1 =  response.routes[0].legs[0].duration.value;

					setTimeout(function() {
						calc(origins[i], destination2, mode2, i, t1);
					}, delay);

				}
			}

			// if no results, skip to next origin
			else {
				setTimeout(function() {
					calc(origins[i+1], destination1, mode1, i+1, null);
				}, delay);
			}
		}

		else {

		}



	})
}

function sumTimes(md) {

	var md2 = []

	for (var i = 0; i < md.length; i++) {
		if (typeof md[i] != 'undefined') {
			md2.push({location: new google.maps.LatLng(md[i].origin.lat, md[i].origin.lng), weight: (md[i].t1 + md[i].t2)});
		}
	}
	md2 = offset(md2);
	console.log(md2);
	return md2;
}

function buildMap(md) {
	// build map
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 33.95, lng: -118.275},
		zoom: 11
	});

	// Add heatmap layer
	new google.maps.visualization.HeatmapLayer({
		data: md, map: map, radius: 100//, maxIntensity: 4000
	});

	console.log('Delay: ' + delay + ' Errors: ' + (100*errorCount/sliceCount) + '%');
}

function offset(md) {

	var minimum = 999999; // barf

	for (var i = 0; i < md.length; i++) {
		if (typeof md[i] != 'undefined') {
			if (md[i].weight < minimum) {
				minimum = md[i].weight;
			}
		}
	}

	for (var i = 0; i < md.length; i++) {
		if (typeof md[i] != 'undefined') {
			md[i].weight = 1 + md[i].weight - minimum;
		}
	}

	return md;
}

// from http://jsbin.com/fanofipusu/edit?html,output
/*var desiredRadiusPerPointInMeters = 100;
function getNewRadius() {

	var numTiles = 1 << map.getZoom();
	var center = map.getCenter();
	var moved = google.maps.geometry.spherical.computeOffset(center, 10000, 90); //1000 meters to the right
	var projection = new MercatorProjection();
	var initCoord = projection.fromLatLngToPoint(center);
	var endCoord = projection.fromLatLngToPoint(moved);
	var initPoint = new google.maps.Point(
	initCoord.x * numTiles,
	initCoord.y * numTiles);
	var endPoint = new google.maps.Point(
	endCoord.x * numTiles,
	endCoord.y * numTiles);
	var pixelsPerMeter = (Math.abs(initPoint.x-endPoint.x))/10000.0;
	var totalPixelSize = Math.floor(desiredRadiusPerPointInMeters*pixelsPerMeter);
	console.log(totalPixelSize);
	return totalPixelSize;

}*/
