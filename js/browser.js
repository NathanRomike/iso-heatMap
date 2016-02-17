var GMaps = require('gmaps');
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      return createMap(position.coords.latitude,position.coords.longitude);
    });
  } else {
    return false;
  }
}

function createMap(lat, lng) {
  var styleArray = [
    {
      featureType: "all",
      stylers: [
       { saturation: -100 }
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
    styles: styleArray
  });
}

$(function() {
  getLocation();

  $("#resetLocation").on("click", function(e) {
    e.preventDefault();
    getLocation();
  });

  $("#location").on("submit", function(e) {
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
        createMap(location.lat, location.lng);
      }
    });

    request.fail(function(jqXHR, textStatus) {
      alert("Something");
    });
  });
});
