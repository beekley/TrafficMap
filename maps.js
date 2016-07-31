 var map;
 function initMap() {
	
	var destination1 = '607 Charles E Young Dr E, Los Angeles, CA 90095';
	var origins = [];
	
	var latMin = 34.01;
	var latMax = 34.09;
	var lngMin = -118.50;
	var lngMax = -118.30;
	var slices = 3;
	var slice = (latMax-latMin)/slices;
	
	for (var i = 0; i <= slices; i++) {
		for (var j = 0; lngMin + j*slice <= lngMax; j++) {
			//console.log(i + ' ' + j);
			origins[i*slices + j] = {lat: latMin + i*slice, lng: lngMin + j*slice};
			
			console.log(origins[i*slices + j]);
		}
	}
		
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 34.0424, lng: -118.4382},
		zoom: 12
	});
	
	var service = new google.maps.DistanceMatrixService;
	service.getDistanceMatrix({
		
		origins: origins,
		destinations: [destination1],
		travelMode: 'DRIVING',
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
		
	}, function(response, status) {
		if (status !== 'OK') {
			alert('Error was: ' + status);
		} else {
			
			var mapData = [];
			for (var i = 0; i < origins.length; i++) {
				
				mapData[i] = {location: new google.maps.LatLng(origins[i].lat, origins[i].lng)};
				mapData[i].weight = response.rows[i].elements[0].duration.value;
				console.log(mapData[i]);
			}
			
			new google.maps.visualization.HeatmapLayer({
				data: mapData, map: map, radius: 90
			});
		}
	})
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