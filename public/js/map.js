var myLat = 0;
var myLng = 0;
var me = new google.maps.LatLng(myLat, myLng);
var myOptions = {
  zoom: 13, // The larger the zoom number, the bigger the zoom
  center: me,
  mapTypeId: google.maps.MapTypeId.ROADMAP,
  mapTypeControl: false
};
var service;
var map;
var markerArray = [];
var rboxer = new RouteBoxer();
var distance = .5; // km

var inputs = JSON.parse(localStorage.getItem('inputs'));
var fbID = JSON.parse(localStorage.getItem('fbID'));
var center;
var centered = false;
var infoWindow = new google.maps.InfoWindow();
var http = new XMLHttpRequest();

// purp: initializes google maps object
// calls: getMyLocation
function init() {
  map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
  getMyLocation();
}

// purp: finds the user's lcation
// calls: if successful, calls renderMap()
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

// purp: renders map, panning to user
// calls: findDirections
function renderMap() {
  me = new google.maps.LatLng(myLat, myLng);


  map.panTo(me);


  var marker = new google.maps.Marker({
    position: me,
  });

  marker.setMap(map);
  findDirections();
}

// purp: initializes a google maps DirectionsService and DirectionsRenderer object
// calls: calculateAndDisplayRoute
function findDirections() {
  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer({map: map});
  directionsDisplay.setMap(map);
  calculateAndDisplayRoute (directionsService, directionsDisplay);
}


// purp: calculates and displays route, uses route boxer to calculate bounds for place search
// args: DirectionsService and DirectionsRenderer object
// calls: restaurant_initialize
// WARNING: Current distance set to 1km for debugging purposes
function calculateAndDisplayRoute(directionsService, directionsDisplay) {
  var originLoc = getOrigin();

  var directionsRequest = {
    origin: originLoc,
    destination: inputs.locationTo[0].geometry.location, 
    travelMode: google.maps.DirectionsTravelMode.DRIVING,
  };

  //sendData();

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




function sendData(){

          //console.log('yo');
          var url = "https://crumbtrail.herokuapp.com/search";

          console.log(inputs.preference);

          var params = "userID=" + fbID + "&foodtype=" + inputs.preference + "&startpoint="+ inputs.locationFrom 
                                                                                + "&endpoint=" + inputs.locationTo;
          console.log(params);
          http.open("POST", url, true);
          console.log('imhere');
          http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        http.onreadystatechange = function() {
        if (http.readyState == 4 && http.status == 200) {
           alert('HELP');
      }
    };
          http.send(params);
}


function getOrigin() {
  if (inputs.locationFrom == null) {
    return me;
  }
  else {
    return inputs.locationFrom[0].geometry.location;
  }

}


// Draw the array of boxes as polylines on the map, only for debugging
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
// purp: set up nearbySearch request uses the bounds from route boxer
// args: the place bounds object array from route boxer
// calls: service.nearbySearch and its processResults callback function
function restaurant_initialize(place) {
  // Specify location, radius and place types for your Places API search.
  var request = {
    bounds: place,
    types: ['restaurant'],
    keyword: inputs.preference //later preference
  };

  // Create the PlaceService and send the request.
  // Handle the callback with an anonymous function.
  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, processResults);
}

// purp: nearbySearch callback function
// args: results array from the nearbySearch request, the request status, and 'pagination', 
//       which has to do with clicking between pages
// calls: createMarkers
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

// args: results array from nearbySearch request
// purp: loops through the results array from the nearbySearch request, and creates the google
//       maps marker for each place
// calls: setWindowContent to set infoWindow content, addInforWindow to add the window to the 
//        marker.
function createMarkers(results) {
  var placesList = document.getElementById('places');
  // Looping through to create markers
  for (var i = 0; i < results.length; i++) {
      var marker = createMarker(map, results[i]);
      var place = results[i];
      markerArray[place.place_id] = marker;

      // Populate results div
      placesList.innerHTML += '<li class="placeItem" onclick=clicked("' + place.place_id + '",this)>' + place.name + '</li>';
      whenClicked(marker, place);
    }
  }

// does: when a marker is clicked, a getDetails request is sent
function whenClicked(marker, place) {
  google.maps.event.addListener(marker, 'click', function() {
    $(".highlighted").removeClass("highlighted");
    fillInDetails(marker, place);
  });
}

//
// purp: take the marker and the place and ask google for details
//       then put those details with the marker in the info window
// args: the marker and the place object.  We use the place.id for detail request
// rets: nothing
// flow: makes an async call for details and then the handler will
//       use the details and the marker to update the map
//
function fillInDetails(marker, place) 
{
    var request = {
        placeId: place.place_id 
    };

    // purp: handler for getDetails service call
    // args: place details object and status of request response 
     
    service.getDetails(request, function (place_dets, status) {
        console.log(status);
        var marker = markerArray[place.place_id];
        var message = setWindowContent(place, place_dets);
        infoWindow.setContent(message);
        infoWindow.open(map, marker);
        marker.setMap(map);  
    });
}

// purp: sets up info window content html string
// rets: a string
function setWindowContent(place, place_dets) {
    var place_name = place.name;
    var content = "<p class=place-title>" + place_name + "</p>";
    // default to not available, fill it details afterwards
    console.log(place_dets);
    var place_price = "Not available";
    var place_rating = "Not available";

    if (place_dets !== null && place_dets.opening_hours.open_now != undefined) {
      if (place_dets.opening_hours.open_now == true) {
        content += "<p>Currently Open</p>";
      }
      else {
        content += "<p>Currently Closed</p>";
      }
    } 

    if (place_dets !== null && place_dets.formatted_address !== undefined) {
      console.log("formatted_address");
      content += "<p>" + place_dets.formatted_address + "</p>";
    } else if (place.vicinity != undefined) {
      content += "<p>" + place.vicinity; + "</p>";
    }

    if (place_dets !== null && place_dets.formatted_phone_number != undefined) {
      content += "<p>Phone Number: " + place_dets.formatted_phone_number + "</p>";
    }

    if (place.price_level != undefined) {
      place_price = "";
      for(var i = 0; i < place.price_level; i++) {
        place_price += "&#x1F4B8";
      }
      content += "<p>Price Level: " + place_price + "</p>";
    }
    if (place_dets !== null && place_dets.rating != undefined) {
      place_rating = "";
      for(var i = 0; i < Math.round(place_dets.rating); i++) {
        place_rating += "&#x1F60B";
      }
      content += "<p>Rating: " + place_rating + "</p>";
    }

    if (place_dets !== null && place_dets.website != undefined) {
      content += "<p><a href=" + place_dets.website + " target='_blank'>Website</a></p>";
    }
    return content;
}

// purp: deals with page response when a marker is clicked
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

