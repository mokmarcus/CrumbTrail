var myLat = 0;
var myLng = 0;
var me = new google.maps.LatLng(myLat, myLng);
var myOptions = {
  zoom: 13, // The larger the zoom number, the bigger the zoom
  center: me,
  mapTypeId: google.maps.MapTypeId.ROADMAP,
  mapTypeControl: false
};
var map;
var markerArray = [];
var rboxer = new RouteBoxer();
var distance = .4; // km
var inputs = JSON.parse(localStorage.getItem('inputs'));
var center;
var centered = false;
var infoWindow = new google.maps.InfoWindow();


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
  var marker = new google.maps.Marker({
    position: me,
  });

  marker.setMap(map);
  findDirections();
}

function findDirections() {
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer({map: map});
    directionsDisplay.setMap(map);
    calculateAndDisplayRoute (directionsService, directionsDisplay);
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
             //drawBoxes(boxes); // draws out boxes, only for debugging
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
  if (!centered) {
    map.panBy(-100, 0);
  }
  centered = true;
  
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    
    createMarkers(results);
    var moreButton = document.getElementById('more');
    if (pagination.hasNextPage) {
      moreButton.disabled = false;
      moreButton.style.cursor = "pointer";

      moreButton.addEventListener('click', function() {
        moreButton.disabled = true;
        moreButton.style.cursor = "not-allowed";
        pagination.nextPage();
      });
    } else {
      moreButton.disabled = true;
      moreButton.style.cursor = "not-allowed";
    }
    
  }
}

function createMarkers(results) {
  var placesList = document.getElementById('places');
  // Looping through to create markers
  for (var i = 0; i < results.length; i++) {
      var marker = createMarker(map, results[i]);
      var place = results[i];
      markerArray[place.id] = marker;

      // Populate results div
      placesList.innerHTML += '<li class="placeItem" onclick=clicked("' + place.id + '",this)>' + place.name + '</li>';

      // If the request succeeds, draw the place location on
      // the map as a marker, and register an event to handle a
      // click on the marker.
      // console.log(place);

      var message = setWindowContent(place);
      addInfoWindow(marker, message)
      marker.setMap(map);
    }
}

function setWindowContent(place) {
    var place_name = place.name;
    var place_address = "Not Available";
    var place_price = "Not Available";
    var place_rating = "Not Available";
    if (place.vicinity != undefined) {
      place_address = place.vicinity;
    }
    if (place.price_level != undefined) {
      place_price = "";
      for(var i = 0; i < place.price_level; i++) {
        place_price += "&#x1F4B8";
      }
    }
    if (place.rating != undefined) {
      place_rating = "";
      for(var i = 0; i < Math.round(place.rating); i++) {
        place_rating += "&#x1F60B";
      }
    }
    var content = '<p class=place-title>' + place_name + '</p>' +
                '<p>Address: ' + place_address + "</p>" +
                '<p>Price Level: ' + place_price + "</p>" +
                '<p>Rating: ' + place_rating + "</p>";
    return content;
}

function addInfoWindow(marker, message) {
  google.maps.event.addListener(marker, 'click', function() {
    $(".highlighted").removeClass("highlighted");
    infoWindow.setContent(message);
    infoWindow.open(map, this);
  });
}

function clicked(id, ref){
  var currMarker = markerArray[id];
  map.setCenter(currMarker.position);
  map.panBy(-100, 0);
  google.maps.event.trigger(currMarker, 'click');
  $(ref).addClass("highlighted");
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

