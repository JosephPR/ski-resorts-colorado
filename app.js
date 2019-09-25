var map;
 // Create a new blank array for all the listing markers.
 var markers = [];
 function initMap() {
   // Create a styles array to use with the map.
   var styles = [
     {
       featureType: 'water',
       stylers: [
         { color: '#0d0feb' }
       ]
     },{
       featureType: 'administrative',
       elementType: 'labels.text.stroke',
       stylers: [
         { color: '#ffffff' },
         { weight: 6 }
       ]
     },{
       featureType: 'administrative',
       elementType: 'labels.text.fill',
       stylers: [
         { color: '#e85113' }
       ]
     },{
       featureType: 'road.highway',
       elementType: 'geometry.stroke',
       stylers: [
         { color: '#efe9e4' },
         { lightness: -100 }
       ]
     },{
       featureType: 'transit.station',
       stylers: [
         { weight: 9 },
         { hue: '#e85113' }
       ]
     },{
       featureType: 'road.highway',
       elementType: 'labels.icon',
       stylers: [
         { visibility: 'on' }
       ]
     },{
       featureType: 'water',
       elementType: 'labels.text.stroke',
       stylers: [
         { lightness: 100 }
       ]
     },{
       featureType: 'water',
       elementType: 'labels.text.fill',
       stylers: [
         { lightness: -100 }
       ]
     },{
       featureType: 'poi',
       elementType: 'geometry',
       stylers: [
         { visibility: 'on' },
         { color: '#f0e4d3' }
       ]
     },{
       featureType: 'road.highway',
       elementType: 'geometry.fill',
       stylers: [
         { color: '#e06565' },
         { lightness: -25 }
       ]
     }
   ];
   // Constructor creates a new map - only center and zoom are required.
   map = new google.maps.Map(document.getElementById('map'), {
     center: {lat: 39.481212, lng: -106.066556},
     zoom: 13,
     styles: styles,
     mapTypeControl: false
   });


  var locations = [
    {title: 'Breckenridge Resort', location: {lat: 39.481212, lng: -106.066556}},
    {title: 'Keystone Ski Area', location: {lat: 39.607283, lng: -105.944126}},
    {title: 'Vail', location: {lat: 39.642908, lng:  -106.372762}},
    {title: 'SteamBoat', location: {lat: 40.483711, lng: -106.825562}},
    {title: 'Beaver Creek', location: {lat: 39.605250, lng: -106.515710}},
    {title: 'Aspen', location: {lat: 39.190670, lng: -106.819200}},
    {title: 'Copper Mountain', location: {lat: 39.500820, lng: -106.146490}},
    {title: 'Winter Park', location: {lat: 39.891060, lng: -105.760720}},
    {title: 'Telluride', location: {lat: 37.937410, lng: -107.811760}},
    {title: 'Park City', location: {lat: 40.646061, lng: -111.497971}},
    {title: 'Snowbird', location: {lat: 39.911850, lng: -111.107269}},

  ];

        var largeInfowindow = new google.maps.InfoWindow();
        // Style the markers a bit. This will be our listing marker icon.
        var defaultIcon = makeMarkerIcon('0091ff');
        // Create a "highlighted location" marker color for when the user
        // mouses over the marker.
        var highlightedIcon = makeMarkerIcon('FFFF24');
        var largeInfowindow = new google.maps.InfoWindow({
           maxWidth: 2000
        });
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
      }
      // This function populates the infowindow when the marker is clicked. We'll only allow
      // one infowindow which will open at the marker that is clicked, and populate based
      // on that markers position.
      function populateInfoWindow(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
          infowindow.setContent('');
          infowindow.marker = marker;
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
          });


          var streetViewService = new google.maps.StreetViewService();
      var radius = 500;
      // In case the status is OK, which means the pano was found, compute the
      // position of the streetview image, then calculate the heading, then get a
      // panorama from that and set the options
      function getStreetView(data, status) {
        if (status == google.maps.StreetViewStatus.OK) {
          var nearStreetViewLocation = data.location.latLng;
          var heading = google.maps.geometry.spherical.computeHeading(
            nearStreetViewLocation, marker.position);
            infowindow.setContent('<div>' + marker.title + '</div><div id="pano" style="height:400px; width: 800px;">Hello</div>');
            var panoramaOptions = {
              position: nearStreetViewLocation,
              pov: {
                heading: heading,
                pitch: 10
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
          'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
          '|40|_|%E2%80%A2',
          new google.maps.Size(21, 34),
          new google.maps.Point(0, 0),
          new google.maps.Point(10, 34),
          new google.maps.Size(21,34));
        return markerImage;
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
