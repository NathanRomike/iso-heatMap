var GMaps = require('gmaps');
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      createMap(position.coords.latitude,position.coords.longitude);
    });
  } else {
    return false;
  }
}

function fillMap(map) {
  var marker = map.markers[0];
  var centerLat = marker.position.lat();
  var centerLng = marker.position.lng();
  var pointsArray = [];
  for(var i = 0; i < 25; i++) {
    var randLat = Math.random() * 0.50 < 0.25 ? Math.random() * 0.25 : -(Math.random() * 0.25);
    var randLng = Math.random() * 0.50 < 0.25 ? Math.random() * 0.25 : -(Math.random() * 0.25);
    var tempLat = centerLat + randLat;
    var tempLng = centerLng + randLng;
    var tempPos = new google.maps.LatLng(tempLat,tempLng);
    pointsArray.push(tempPos);
  }
  var request = new google.maps.DistanceMatrixService().getDistanceMatrix({
    origins:[marker.position],
    destinations: pointsArray,
    travelMode: google.maps.TravelMode.DRIVING
  }, function(response, status) {
    var timeDistArr = [];
    for(var j = 0; j < response.destinationAddresses.length; j++) {
      var timeDistance = [
        response.destinationAddresses[j],
        response.rows[0].elements[j].duration.value
      ]
      timeDistArr.push(timeDistance);
    }
    for(var k = 0; k < timeDistArr.length; k++) {
      new google.maps.Geocoder().geocode({'address': timeDistArr[k][0]}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          var position = new google.maps.LatLng(results[0].geometry.location.lat(),results[0].geometry.location.lng());
          console.log(position);
          map.drawCircle({
            radius: 5000,
            fillColor: "red",
            fillOpacity: Math.random(),
            lat: position.lat(),
            lng: position.lng(),
            strokeWidth: 0
          });
        } else {
          console.log(timeDistArr[k][0]);
        }
      })
    }
  });
}

function createMap(lat, lng) {
  var styleArray = [
    {
      featureType: "all",
      stylers: [
       { saturation: -80 }
      ]
    },{
      featureType: "road.arterial",
      elementType: "geometry",
      stylers: [
        { hue: "#00ffee" },
        { saturation: -100 }
      ]
    },{
      featureType: "poi.business",
      elementType: "labels",
      stylers: [
        { visibility: "off" }
      ]
    }
  ];

  var map = new GMaps({
    div: '#google-map',
    lat: lat,
    lng: lng,
    styles: styleArray,
    zoom: 10
  });

  var marker = map.addMarker({lat: lat, lng: lng});
  fillMap(map);
}

$(function() {
  var map = getLocation();

  $("#resetLocation").on("click", function(e) {
    e.preventDefault();
    getLocation();
  });

  $("#location").submit(function(e) {
    e.preventDefault();
    var input = $("#userLocation").val();
    var requestUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=" +
                     input + "&key=AIzaSyAup2UosPinubq3ITXfGnGvcDwR7GTGucU";
    var request = $.ajax({
      method: "POST",
      url: requestUrl,
      dataType: "json"
    });

    request.done(function(data) {
      if (data.status === "ZERO_RESULTS") {
        return alert("location not found");
      } else {
        var location = data.results[0].geometry.location;
        map = createMap(location.lat, location.lng);
      }
    });

    request.fail(function(jqXHR, textStatus) {
      alert("Something");
    });
  });
});
