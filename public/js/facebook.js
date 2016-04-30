window.fbAsyncInit = function() {
    FB.init({
        appId      : '500011233519109',
        cookie     : true,
        xfbml      : true,
        version    : 'v2.6'
    });

    FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
            //console.log(response.authResponse.accessToken);
            logged_in();
        }
        else {
            logged_out();
        }
    });
};

(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);         
}(document, 'script', 'facebook-jssdk'));


function login() {
    FB.login(function(response) {
        if (response.status === 'connected') {
            logged_in();
        }
    });
}

function logout() {
    FB.logout(function(response) {
        logged_out();
    });
}

function logged_out() {
    var d = document.getElementById('fb-login')
    d.className = "";
    d.innerHTML =
    "<a onclick='login();' role='button'> Login <span class='glyphicon glyphicon-log-in'></span></a>";    
}

function logged_in() {
    FB.api('/me', function(response) {
        var d = document.getElementById('fb-login')
        d.className += "dropdown";
        d.innerHTML =
        "<a href='#' class='dropdown-toggle' data-toggle='dropdown' role='button' aria-haspopup='true' aria-expanded='false'> "
        + response.name
        + " <span class='caret'></span></a>"
        + "<ul class='dropdown-menu'>"
        + "<li><a href='#' role='button'> My Past Searches </a></li>"
        + "<li role='separator' class='divider'></li>"
        + "<li><a onclick='logout();' role='button'> Logout <span class='glyphicon glyphicon-log-out'></span></a></li>"
        + "</ul>";
    });
}