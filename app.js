 var map;
 // Create a new blank array for all the listing markers.
 var markers = [];
 // This global polygon variable is to ensure only ONE polygon is rendered.
 var polygon = null;

 function initMap() {
   // Create a styles array to use with the map.
   var styles = [{
     featureType: 'water',
     stylers: [{
       color: '#0d0feb'
     }]
   }, {
     featureType: 'administrative',
     elementType: 'labels.text.stroke',
     stylers: [{
         color: '#ffffff'
       },
       {
         weight: 6
       }
     ]
   }, {
     featureType: 'administrative',
     elementType: 'labels.text.fill',
     stylers: [{
       color: '#e85113'
     }]
   }, {
     featureType: 'road.highway',
     elementType: 'geometry.stroke',
     stylers: [{
         color: '#efe9e4'
       },
       {
         lightness: -100
       }
     ]
   }, {
     featureType: 'transit.station',
     stylers: [{
         weight: 9
       },
       {
         hue: '#e85113'
       }
     ]
   }, {
     featureType: 'road.highway',
     elementType: 'labels.icon',
     stylers: [{
       visibility: 'on'
     }]
   }, {
     featureType: 'water',
     elementType: 'labels.text.stroke',
     stylers: [{
       lightness: 100
     }]
   }, {
     featureType: 'water',
     elementType: 'labels.text.fill',
     stylers: [{
       lightness: -100
     }]
   }, {
     featureType: 'poi',
     elementType: 'geometry',
     stylers: [{
         visibility: 'on'
       },
       {
         color: '#f0e4d3'
       }
     ]
   }, {
     featureType: 'road.highway',
     elementType: 'geometry.fill',
     stylers: [{
         color: '#e06565'
       },
       {
         lightness: -25
       }
     ]
   }];
   // Constructor creates a new map - only center and zoom are required.
   map = new google.maps.Map(document.getElementById('map'), {
     center: {
       lat: 39.481212,
       lng: -106.066556
     },
     zoom: 13,
     styles: styles,
     mapTypeControl: false
   });


   var locations = [{
       title: 'Breckenridge Resort',
       location: {
         lat: 39.481212,
         lng: -106.066556
       }
     },
     {
       title: 'Keystone Ski Area',
       location: {
         lat: 39.607283,
         lng: -105.944126
       }
     },
     {
       title: 'Vail',
       location: {
         lat: 39.642908,
         lng: -106.372762
       }
     },
     {
       title: 'SteamBoat',
       location: {
         lat: 40.483711,
         lng: -106.825562
       }
     },
     {
       title: 'Beaver Creek',
       location: {
         lat: 39.605250,
         lng: -106.515710
       }
     },
     {
       title: 'Aspen',
       location: {
         lat: 39.190670,
         lng: -106.819200
       }
     },
     {
       title: 'Copper Mountain',
       location: {
         lat: 39.500820,
         lng: -106.146490
       }
     },
     {
       title: 'Winter Park',
       location: {
         lat: 39.891060,
         lng: -105.760720
       }
     },
     {
       title: 'Telluride',
       location: {
         lat: 37.937410,
         lng: -107.811760
       }
     },
     {
       title: 'Park City',
       location: {
         lat: 40.646061,
         lng: -111.497971
       }
     },
     {
       title: 'Snowbird',
       location: {
         lat: 39.911850,
         lng: -111.107269
       }
     },

   ];

   var largeInfowindow = new google.maps.InfoWindow();
   // Initialize the drawing manager.
   var drawingManager = new google.maps.drawing.DrawingManager({
     drawingMode: google.maps.drawing.OverlayType.POLYGON,
     drawingControl: true,
     drawingControlOptions: {
       position: google.maps.ControlPosition.TOP_LEFT,
       drawingModes: [
         google.maps.drawing.OverlayType.POLYGON
       ]
     }
   });
   // Style the markers a bit. This will be our listing marker icon.
   var defaultIcon = makeMarkerIcon('0091ff');
   // Create a "highlighted location" marker color for when the user
   // mouses over the marker.
   var highlightedIcon = makeMarkerIcon('FFFF24');
   // The following group uses the location array to create an array of markers on initialize.
   for (var i = 0; i < locations.length; i++) {
     // Get the position from the location array.
     var position = locations[i].location;
     var title = locations[i].title;
     // Create a marker per location, and put into markers array.
     var marker = new google.maps.Marker({
       position: position,
       title: title,
       animation: google.maps.Animation.DROP,
       icon: defaultIcon,
       id: i
     });
     // Push the marker to our array of markers.
     markers.push(marker);
     // Create an onclick event to open the large infowindow at each marker.
     marker.addListener('click', function() {
       populateInfoWindow(this, largeInfowindow);
     });
     // Two event listeners - one for mouseover, one for mouseout,
     // to change the colors back and forth.
     marker.addListener('mouseover', function() {
       this.setIcon(highlightedIcon);
     });
     marker.addListener('mouseout', function() {
       this.setIcon(defaultIcon);
     });
   }
   document.getElementById('show-listings').addEventListener('click', showListings);
   document.getElementById('hide-listings').addEventListener('click', hideListings);
   document.getElementById('toggle-drawing').addEventListener('click', function() {
     toggleDrawing(drawingManager);
   });
   document.getElementById('zoom-to-area').addEventListener('click', function() {
     zoomToArea();
   });

   document.getElementById('search-within-time').addEventListener('click', function() {
     searchWithinTime();
   });
   // Add an event listener so that the polygon is captured,  call the
   // searchWithinPolygon function. This will show the markers in the polygon,
   // and hide any outside of it.
   drawingManager.addListener('overlaycomplete', function(event) {
     // First, check if there is an existing polygon.
     // If there is, get rid of it and remove the markers
     if (polygon) {
       polygon.setMap(null);
       hideListings(markers);
     }
     // Switching the drawing mode to the HAND (i.e., no longer drawing).
     drawingManager.setDrawingMode(null);
     // Creating a new editable polygon from the overlay.
     polygon = event.overlay;
     polygon.setEditable(true);
     // Searching within the polygon.
     searchWithinPolygon();
     // Make sure the search is re-done if the poly is changed.
     polygon.getPath().addListener('set_at', searchWithinPolygon);
     polygon.getPath().addListener('insert_at', searchWithinPolygon);
   });
 }
 // This function populates the infowindow when the marker is clicked. We'll only allow
 // one infowindow which will open at the marker that is clicked, and populate based
 // on that markers position.
 function populateInfoWindow(marker, infowindow) {
   // Check to make sure the infowindow is not already opened on this marker.
   if (infowindow.marker != marker) {
     // Clear the infowindow content to give the streetview time to load.
     infowindow.setContent('');
     infowindow.marker = marker;
     // Make sure the marker property is cleared if the infowindow is closed.
     infowindow.addListener('closeclick', function() {
       infowindow.marker = null;
     });
     var streetViewService = new google.maps.StreetViewService();
     var radius = 50;
     // In case the status is OK, which means the pano was found, compute the
     // position of the streetview image, then calculate the heading, then get a
     // panorama from that and set the options
     function getStreetView(data, status) {
       if (status == google.maps.StreetViewStatus.OK) {
         var nearStreetViewLocation = data.location.latLng;
         var heading = google.maps.geometry.spherical.computeHeading(
           nearStreetViewLocation, marker.position);
         infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
         var panoramaOptions = {
           position: nearStreetViewLocation,
           pov: {
             heading: heading,
             pitch: 30
           }
         };
         var panorama = new google.maps.StreetViewPanorama(
           document.getElementById('pano'), panoramaOptions);
       } else {
         infowindow.setContent('<div>' + marker.title + '</div>' +
           '<div>No Street View Found</div>');
       }
     }
     // Use streetview service to get the closest streetview image within
     // 50 meters of the markers position
     streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
     // Open the infowindow on the correct marker.
     infowindow.open(map, marker);
   }
 }
 // This function will loop through the markers array and display them all.
 function showListings() {
   var bounds = new google.maps.LatLngBounds();
   // Extend the boundaries of the map for each marker and display the marker
   for (var i = 0; i < markers.length; i++) {
     markers[i].setMap(map);
     bounds.extend(markers[i].position);
   }
   map.fitBounds(bounds);
 }
 // This function will loop through the listings and hide them all.
 function hideListings() {
   for (var i = 0; i < markers.length; i++) {
     markers[i].setMap(null);
   }
 }
 // This function takes in a COLOR, and then creates a new marker
 // icon of that color. The icon will be 21 px wide by 34 high, have an origin
 // of 0, 0 and be anchored at 10, 34).
 function makeMarkerIcon(markerColor) {
   var markerImage = new google.maps.MarkerImage(
     'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
     '|40|_|%E2%80%A2',
     new google.maps.Size(21, 34),
     new google.maps.Point(0, 0),
     new google.maps.Point(10, 34),
     new google.maps.Size(21, 34));
   return markerImage;
 }
 // This shows and hides (respectively) the drawing options.
 function toggleDrawing(drawingManager) {
   if (drawingManager.map) {
     drawingManager.setMap(null);
     // In case the user drew anything, get rid of the polygon
     if (polygon !== null) {
       polygon.setMap(null);
     }
   } else {
     drawingManager.setMap(map);
   }
 }
 // This function hides all markers outside the polygon,
 // and shows only the ones within it. This is so that the
 // user can specify an exact area of search.
 function searchWithinPolygon() {
   for (var i = 0; i < markers.length; i++) {
     if (google.maps.geometry.poly.containsLocation(markers[i].position, polygon)) {
       markers[i].setMap(map);
     } else {
       markers[i].setMap(null);
     }
   }
 }
 // This function takes the input value in the find nearby area text input
 // locates it, and then zooms into that area. This is so that the user can
 // show all listings, then decide to focus on one area of the map.
 function zoomToArea() {
   // Initialize the geocoder.
   var geocoder = new google.maps.Geocoder();
   // Get the address or place that the user entered.
   var address = document.getElementById('zoom-to-area-text').value;
   // Make sure the address isn't blank.
   if (address == '') {
     window.alert('You must enter an area, or address.');
   } else {
     // Geocode the address/area entered to get the center. Then, center the map
     // on it and zoom in
     geocoder.geocode({
       address: address,
       componentRestrictions: {
         locality: 'Colorado'
       }
     }, function(results, status) {
       if (status == google.maps.GeocoderStatus.OK) {
         map.setCenter(results[0].geometry.location);
         map.setZoom(15);
       } else {
         window.alert('We could not find that location - try entering a more' +
           ' specific place.');
       }
     });
   }
 }

 // This function allows the user to input a desired travel time, in
// minutes, and a travel mode, and a location - and only show the listings
// that are within that travel time (via that travel mode) of the location
function searchWithinTime() {
  // Initialize the distance matrix service.
  var distanceMatrixService = new google.maps.DistanceMatrixService;
  var address = document.getElementById('search-within-time-text').value;
  // Check to make sure the place entered isn't blank.
  if (address == '') {
    window.alert('You must enter an address.');
  } else {
    hideListings();
    // Use the distance matrix service to calculate the duration of the
    // routes between all our markers, and the destination address entered
    // by the user. Then put all the origins into an origin matrix.
    var origins = [];
    for (var i = 0; i < markers.length; i++) {
      origins[i] = markers[i].position;
    }
    var destination = address;
    var mode = document.getElementById('mode').value;
    // Now that both the origins and destination are defined, get all the
    // info for the distances between them.
    distanceMatrixService.getDistanceMatrix({
      origins: origins,
      destinations: [destination],
      travelMode: google.maps.TravelMode[mode],
      unitSystem: google.maps.UnitSystem.IMPERIAL,
    }, function(response, status) {
      if (status !== google.maps.DistanceMatrixStatus.OK) {
        window.alert('Error was: ' + status);
      } else {
        displayMarkersWithinTime(response);
      }
    });
  }
}
// This function will go through each of the results, and,
// if the distance is LESS than the value in the picker, show it on the map.
function displayMarkersWithinTime(response) {
  var maxDuration = document.getElementById('max-duration').value;
  var origins = response.originAddresses;
  var destinations = response.destinationAddresses;
  // Parse through the results, and get the distance and duration of each.
  // Because there might be  multiple origins and destinations we have a nested loop
  // Then, make sure at least 1 result was found.
  var atLeastOne = false;
  for (var i = 0; i < origins.length; i++) {
    var results = response.rows[i].elements;
    for (var j = 0; j < results.length; j++) {
      var element = results[j];
      if (element.status === "OK") {
        // The distance is returned in feet, but the TEXT is in miles. If we wanted to switch
        // the function to show markers within a user-entered DISTANCE, we would need the
        // value for distance, but for now we only need the text.
        var distanceText = element.distance.text;
        // Duration value is given in seconds so we make it MINUTES. We need both the value
        // and the text.
        var duration = element.duration.value / 60;
        var durationText = element.duration.text;
        if (duration <= maxDuration) {
          //the origin [i] should = the markers[i]
          markers[i].setMap(map);
          atLeastOne = true;
          // Create a mini infowindow to open immediately and contain the
          // distance and duration
          var infowindow = new google.maps.InfoWindow({
            content: durationText + ' away, ' + distanceText
          });
          infowindow.open(map, markers[i]);
          // Put this in so that this small window closes if the user clicks
          // the marker, when the big infowindow opens
          markers[i].infowindow = infowindow;
          google.maps.event.addListener(markers[i], 'click', function() {
            this.infowindow.close();
          });
        }
      }
    }
  }
  if (!atLeastOne) {
    window.alert('We could not find any locations within that distance!');
  }
}

 // one marker with an info window
 // var tribeca = {lat: 40.741359, lng: -73.9980244};
 // var marker = new google.maps.Marker({
 //   position: tribeca,
 //   map: map,
 //   title: 'First Marker!'
 // });
 // var infowindow = new google.maps.InfoWindow({
 //   content: 'Do you ever feel like an InfoWindow, floating in the wind,' +
 //   ' ready to start again?'
 // });
 // marker.addListener('click', function() {
 //   infowindow.open(map, marker);
 // });
