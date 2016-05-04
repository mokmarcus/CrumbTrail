// $(document).ready(function() {
	var http = new XMLHttpRequest();
	var fbID = JSON.parse(localStorage.getItem('fbID'));
	var url = "http://crumbtrail.herokuapp.com/past?userID=" + fbID; //CHANGE THIS URL
	// var url = "http://localhost:3000/past?userID=" + fbID;
	http.open("GET", url, true);
	http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	var html="";

	http.onreadystatechange = function() {
	    if (http.readyState == 4 && http.status == 200) {
	    	var arr = JSON.parse(http.responseText);
	       for (var i = arr.length - 1; i >= 0; i--) {
	       		var locationFrom = arr[i].startpoint;
	       		var locationTo = arr[i].endpoint;
	       		var preference = arr[i].foodtype;
	       		var date = arr[i].date;
				html += "<div class='col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2 box'>";
				html += "<p>Starting point: " + locationFrom + "</p>";
				html += "<p>Destination: " + locationTo + "</p>";
				html += "<p>Food Preference: " + preference + "</p>";
				html += "<p>Search Date: " + date + "</p>";
				html += "</div>";
	       		document.getElementById("past-searches").innerHTML = html;
	       }
	    }
	};
	http.send(null);

	// $(".box")on("click", function(e){
	// 	window.location.href = 'partial/map.html';
	// });
// });