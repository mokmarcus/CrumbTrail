var myLat = 0;
var myLng = 0;
var request = new XMLHttpRequest();
var me = new google.maps.LatLng(myLat, myLng);
var dest = new google.maps.LatLng(42.4002, 71.11674);
var myOptions = {
  zoom: 13, // The larger the zoom number, the bigger the zoom
  center: me,
  mapTypeId: google.maps.MapTypeId.ROADMAP
};

var map;
var marker;
var infowindow = new google.maps.InfoWindow();
var markerArray = [];
var rboxer = new RouteBoxer();
var distance = .4; // km
var inputs = JSON.parse(localStorage.getItem('inputs'));

function init() {
  map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
  getMyLocation();
}

function getMyLocation() {
  if (navigator.geolocation) { // the navigator.geolocation object is supported on your browser
    navigator.geolocation.getCurrentPosition(function(position) {
      myLat = position.coords.latitude;
      myLng = position.coords.longitude;
      renderMap();
    });
  }
  else {
    alert("Geolocation is not supported by your web browser.");
  }
}

function renderMap() {
  me = new google.maps.LatLng(myLat, myLng);

  // Update map and go there...
  map.panTo(me);
  // Create a marker
  /*marker = new google.maps.Marker({
    position: me,
    title: "Here I Am!"
  });
  marker.setMap(map);*/
  findDirections();

  // Open info window on click of marker
  // google.maps.event.addListener(marker, 'click', function() {
  //   infowindow.setContent(marker.title);
  //   infowindow.open(map, marker);
  // });
}

function findDirections() {
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer({map: map});
    directionsDisplay.setMap(map);

    // TODO: Add event statement so that when user add destination, then request sent
    // var onSubmitHandler = function() {
    calculateAndDisplayRoute (directionsService, directionsDisplay);
    // }
    // document.getElementById('dest').addEventListener('submit', onChangeHandler);
}

// WARNING: Current distance set to 1km for debugging purposes
function calculateAndDisplayRoute(directionsService, directionsDisplay) {
    var directionsRequest = {
        origin: inputs.locationFrom[0].geometry.location,
        destination: inputs.locationTo[0].geometry.location, 
        travelMode: google.maps.DirectionsTravelMode.DRIVING,
    };

    directionsService.route(directionsRequest, function(response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
            // Box the overview path of the first route
            var path = response.routes[0].overview_path;
            var boxes = rboxer.box(path, distance);

             drawBoxes(boxes); // draws out boxes, only for debugging

            for (var i = 0; i < boxes.length; i++) {
              var bounds = boxes[i];
              // this is where we will perform search over this bounds 
              restaurant_initialize(bounds);
            } 
        }

        else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}

// Draw the array of boxes as polylines on the map
function drawBoxes(boxes) {
  boxpolys = new Array(boxes.length);
  for (var i = 0; i < boxes.length; i++) {
    boxpolys[i] = new google.maps.Rectangle({
      bounds: boxes[i],
      fillOpacity: 0,
      strokeOpacity: 1.0,
      strokeColor: '#000000',
      strokeWeight: 2,
      map: map
    });
  }
}

function restaurant_initialize(place) {
  // Specify location, radius and place types for your Places API search.
  var request = {
    bounds: place,
    types: ['restaurant'],
    keyword: inputs.preference //later preference
  };

  // Create the PlaceService and send the request.
  // Handle the callback with an anonymous function.
  var service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, processResults);
}

function processResults(results, status, pagination) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    createMarkers(results);

    if (pagination.hasNextPage) {
      var moreButton = document.getElementById('more');

      moreButton.disabled = false;

      moreButton.addEventListener('click', function() {
        moreButton.disabled = true;
        pagination.nextPage();
      });
    }
  }
}

function createMarkers(results) {
  var placesList = document.getElementById('places');
  for (var i = 0; i < results.length; i++) {
      var marker = createMarker(map, results[i]);
      var place = results[i];

      // If the request succeeds, draw the place location on
      // the map as a marker, and register an event to handle a
      // click on the marker.
      google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent('<div><strong>' + this.title + '</strong><br>' +
            '<br>' + this.position + '</div>');
        infowindow.open(map, this);
      });
      marker.setMap(map);

      placesList.innerHTML += '<li class="placeItem">' + place.name + '</li>';

    }
}

function createMarker(map, place) {
  var marker = new google.maps.Marker({
    position: place.geometry.location,
    map: map,
    title: place.name,
    draggable: false
  });
  return marker;
}

