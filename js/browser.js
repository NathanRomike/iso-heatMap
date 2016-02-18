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
  var dist = 0.25;
  var callCount = 0;
  for(var j = 0; j < 4; j++) {
    genCircles(map,dist);
    dist+=0.05;
  }
  var repeat = setInterval(function() {
    if (callCount < 10) {
      for(var i = 0; i < 4; i++) {
        genCircles(map,dist);
        dist+=0.03;
      }
      callCount++;
    } else {
      clearInterval(repeat);
    }
  }, 10000);
}

function drawCircle(point, radius, dir)
{
    var d2r = Math.PI / 180;   // degrees to radians
    var r2d = 180 / Math.PI;   // radians to degrees
    var earthsradius = 3963; // 3963 is the radius of the earth in miles
    var points = 32;

    // find the raidus in lat/lon
    var rlat = (radius / earthsradius) * r2d;
    var rlng = rlat / Math.cos(point.lat() * d2r);

    var extp = new Array();
    if (dir==1) {var start=0;var end=points+1} // one extra here makes sure we connect the
    else{var start=points+1;var end=0}
    for (var i=start; (dir==1 ? i < end : i > end); i=i+dir)
    {
        var theta = Math.PI * (i / (points/2));
        ey = point.lng() + (rlng * Math.cos(theta)); // center a + radius x * cos(theta)
        ex = point.lat() + (rlat * Math.sin(theta)); // center b + radius y * sin(theta)
        extp.push(new google.maps.LatLng(ex, ey));
    }
    return extp;
}

function genCircles(map,dist) {
  var marker = map.markers[0];
  var centerLat = marker.position.lat();
  var centerLng = marker.position.lng();
  var pointsArray = [];
  for(var i = 0; i < 25; i++) {
    var randLat = Math.random() * 0.50 < 0.25 ? Math.random() * dist : -(Math.random() * dist);
    var randLng = Math.random() * 0.50 < 0.25 ? Math.random() * dist : -(Math.random() * dist);
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
    console.log(response);
    var timeDistArr = [];
    for(var j = 0; j < response.destinationAddresses.length; j++) {
      var timeDistance = [
        response.destinationAddresses[j],
        response.rows[0].elements[j].duration.value
      ]
      timeDistArr.push(timeDistance);
    }
    for(var k = 0; k < pointsArray.length; k++) {
      if(timeDistArr[k][1]/60 < 10) {
        color = "green";
      } else if (timeDistArr[k][1]/60 < 30) {
        color = "yellow";
      } else if (timeDistArr[k][1]/60 < 60){
        color = "orange";
      } else if(timeDistArr[k][1]/60 < 180) {
        color = "red";
      } else {
        color = "purple";
      }
      map.drawPolygon({
        paths: [drawCircle(pointsArray[k], 5, 1)],
        fillColor: color,
        fillOpacity: 0.1,
        strokeOpacity: 0,
      });
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
                     input + "&key=AIzaSyDcRFgqQ2qoymJrE5O2YfK8qdoERKuvTXY";
    var request = $.ajax({
      method: "POST",
      url: requestUrl,
      dataType: "json"
    });

    request.done(function(data) {
      if (data.status === "ZERO_RESULTS") {
        return alert("location not found");
      } else {
        console.log(data);
        var location = data.results[0].geometry.location;
        map = createMap(location.lat, location.lng);
      }
    });

    request.fail(function(jqXHR, textStatus) {
      alert("Something");
    });
  });
});
