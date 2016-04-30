$(document).ready(function() {

    //Initialize type-it
    $('.type-it').typeIt({
        strings: "<h1>Never be hungry on the road again.</h1>",
        //speed: 100,
        lifeLike: true,
        cursor: true
    });

    //Initialize google places search bars
    inputs = {
        'locationFrom': null,
        'locationTo': null,
        'preference': null
    }
    var inputFrom = document.getElementById('input-from');
    var searchBoxFrom = new google.maps.places.SearchBox(inputFrom);
    searchBoxFrom.addListener('places_changed', function() {
        var placesFrom = searchBoxFrom.getPlaces();
        inputs.locationFrom = placesFrom;
        localStorage.setItem('inputs', JSON.stringify(inputs));
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
        localStorage.setItem('inputs', JSON.stringify(inputs));
        if (placesTo.length == 0) {
            return;
        }
    });
    stopEvent(inputTo);
    
    // use this to get items --> JSON.parse(localStorage.getItem('inputs')));

    //go to maps
    $(document).keypress(function(event){
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if(keycode == '13'){
            window.location.href = '../partial/map.html';
        }
    });

    

});

function stopEvent(input) {
    google.maps.event.addDomListener(input, 'keydown', function(e) { 
        if (e.keyCode == 13) { 
            e.preventDefault();
        }
    });
}

function getPref() {
    inputPref = document.getElementById('input-pref');
    inputs.preference = inputPref.options[inputPref.selectedIndex].text;
    localStorage.setItem('inputs', JSON.stringify(inputs));
}

