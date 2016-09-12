 var map;
 function initMap() {
	
	var destination1 = '607 Charles E Young Dr E, Los Angeles, CA 90095';
	var origins = [];
	
	var latMin = 34.01;
	var latMax = 34.09;
	var lngMin = -118.50;
	var lngMax = -118.30;
	var slices = 5;
	var slice = (latMax-latMin)/slices;
	var sliceCount = 0;
	
	for (var i = 0; i <= slices; i++) {
		for (var j = 0; lngMin + j*slice <= lngMax; j++) {
			//console.log(i + j*slices);
			
			origins[i + j*(slices+1)] = {lat: latMin + i*slice, lng: lngMin + j*slice};
			sliceCount++;
			//console.log(origins[i*slices + j]);
		}
	}
		
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 34.0424, lng: -118.4382},
		zoom: 13
	});
	

	// distance data to plot
	var mapData = [];
	var subsetCursor = 0;
	var ss = 20; //subset size
	var subsetCount = Math.floor(sliceCount/ss);

	//console.log(sliceCount);
	
	// run google maps service multiple times
	// probably going to have to make this recursive
	for (var j = 0; j < subsetCount; j++) {

		var originsSubset = []

		for (var i = 0; i < ss && subsetCursor < sliceCount; i++) {
			originsSubset[i] = origins[subsetCursor];
			subsetCursor++;
			//console.log(subsetCursor);
		}
		//console.log(originsSubset);

		var service = new google.maps.DistanceMatrixService;
		service.getDistanceMatrix({
			
			origins: originsSubset,
			destinations: [destination1],
			travelMode: 'DRIVING',
	        unitSystem: google.maps.UnitSystem.METRIC,
	        avoidHighways: false,
	        avoidTolls: false
			
		}, function(response, status) {
			if (status !== 'OK') {
				alert('Error was: ' + status);
			} else {
				
				
				
				for (var i = 0; i < ss && subsetCursor < sliceCount; i++) {

					/*if (originsSubset[i]){
						mapData[subsetCursor] = {location: new google.maps.LatLng(originsSubset[i].lat, originsSubset[i].lng)};
						mapData[subsetCursor].weight = response.rows[i].elements[0].duration.value;
						//console.log(originsSubset[i]);
						
					}*/
					
				}
				
			}
		})
	}
	

	// hmm this is asynchronous with the distance matrix
	//console.log(mapData);
	new google.maps.visualization.HeatmapLayer({
		data: mapData, map: map, radius: 120
	});
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