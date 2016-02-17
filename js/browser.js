var GMaps = require('gmaps');

$(function() {
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
        { saturation: 50 }
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
    lat: 39.743296277167325,
    lng: -105.00517845153809,
    styles: styleArray
  });
});
