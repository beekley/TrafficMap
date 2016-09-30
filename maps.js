 var map;
 function initMap() {
	
	var destination1 = '607 Charles E Young Dr E, Los Angeles, CA 90095';
	var origins = [];
	
	var latMin = 33.80;
	var latMax = 34.10;
	var lngMin = -118.50;
	var lngMax = -118.05;
	var slices = 8;
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
		zoom: 11
	});
	

	// distance data to plot
	var mapData = [];
	var subsetCursor = 0;
	var ss = 25; //subset size, number of slices in subset
	var subsetCount = Math.floor(sliceCount/ss);
	var subsetIndex = 0;
	

	//console.log(sliceCount);
	
	// run google maps service multiple times
	// probably going to have to make this recursive
	for (var j = 0; j < subsetCount; j++) {

		let originsSubset = [];

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
				
				// Map data for this particular subset
				var subsetMapData = [];
				
				for (var i = 0; i < ss; i++) {
					if (response.rows[i].elements[0].status != "ZERO_RESULTS") {
						subsetMapData.push({location: new google.maps.LatLng(originsSubset[i].lat, originsSubset[i].lng), weight: response.rows[i].elements[0].duration.value});
					}
					
				}
				
				//add subset's mapdata to total mapdata
				mapData.push(subsetMapData);
				
				//increment subset counter
				subsetIndex++;
				
				// if all subsets calculated, then add to map
				if (subsetIndex >= subsetCount) {
					var totalMapData = []
					
					for (var i = 0; i < mapData.length; i++) {
						for (var k = 0; k < mapData[i].length; k++) {
							totalMapData.push(mapData[i][k]);
							//console.log(mapData[i][k]);
						}
					}
					
					//console.log(totalMapData);
					new google.maps.visualization.HeatmapLayer({
						data: totalMapData, map: map, radius: 100
					});
				}
				
				
			}
		})
	}
}

function calculateSubset(originsSubset, destination) {
	
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