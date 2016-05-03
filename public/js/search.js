$(document).ready(function() {
    //Initialize type-it
    if ($(this).width() > 480) {
        $('.type-it').typeIt({
            strings: "<h1>Never be hungry on the road again.</h1>",
            //speed: 100,
            lifeLike: true,
            cursor: true
        });
    }

    //Initialize google places search bars
    inputs = {
        'locationFrom': null,
        'locationTo': null,
        'preference': null,
    }

    var inputFrom = document.getElementById('input-from');
    var searchBoxFrom = new google.maps.places.SearchBox(inputFrom);
    searchBoxFrom.addListener('places_changed', function() {
        var placesFrom = searchBoxFrom.getPlaces();
        inputs.locationFrom = placesFrom;
        if (placesFrom.length == 0) {
            return;
        }
    });
    stopEvent(inputFrom);



    var inputTo = document.getElementById('input-to');
    var searchBoxTo = new google.maps.places.SearchBox(inputTo);
    searchBoxTo.addListener('places_changed', function() {
        var placesTo = searchBoxTo.getPlaces();
        inputs.locationTo = placesTo;
        if (placesTo.length == 0) {
            return;
        }
    });
    stopEvent(inputTo);

    $('#input-pref').change(function(event) {
        var inputPref = document.getElementById('input-pref');
        inputs.preference = inputPref.options[inputPref.selectedIndex].text;
    });

    //go to maps
    $('#search').on('click', function(event) {
        fireRequest();
    });
    $(document).keypress(function(event){
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13'){
            fireRequest();
        }
    });
});

function fireRequest() {
    if (inputs.locationTo == null) {
        window.alert("Please enter a destination.");
    } else if (inputs.preference == "Anything works!") {
        inputs.preference = null;
    } else {
        localStorage.setItem('inputs', JSON.stringify(inputs));
        window.location.href = 'partial/map.html';
    } 
}

function stopEvent(input) {
    google.maps.event.addDomListener(input, 'keydown', function(e) { 
        if (e.keyCode == 13) { 
            e.preventDefault();
        }
    });
}

