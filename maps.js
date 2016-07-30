 var map;
 function initMap() {
	
	var destination1 = '607 Charles E Young Dr E, Los Angeles, CA 90095';
	var origins = [];
	origins[0] = {lat: 34.0423929, lng: -118.4381743};
	origins[1] = '3000 S Bentley Ave, Los Angeles, CA 90025';
	
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 34.0423929, lng: -118.4381743},
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
			console.log(response);
		}
	})
}