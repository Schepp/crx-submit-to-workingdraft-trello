var onAuthorize = function() {
	updateLoggedIn();
	$("#output").empty();

	Trello.members.get("me", function(member){
		updateAuth();
		$("#output").append("You're now authenticated. Close me and start being productive.");
	});
};

var updateLoggedIn = function() {
	var isLoggedIn = Trello.authorized();
	$("#loggedout").toggle(!isLoggedIn);
	$("#loggedin").toggle(isLoggedIn);        
};

var logout = function() {
	Trello.deauthorize();
	updateLoggedIn();
	localStorage['auth'] = '0';
};

var updateAuth = function() {
	localStorage['auth'] = '1';
};

var authorize = function(){
	if(typeof Trello === 'undefined'){
		window.setTimeout(function(){
			authorize();
		},200);
	}
	else {
		Trello.authorize({
			interactive:false,
			scope: {
				read: true,
				write: true,
				account: false
			},
			success: onAuthorize
		});
	}
}

$.getScript('https://api.trello.com/1/client.js?key=' + localStorage['apikey'], function() {
	$("#connectLink")
	.click(function(){
		Trello.authorize({
			expiration: "never",
			scope: {
				read: true,
				write: true,
				account: false
			},
			success: onAuthorize
		})
	});
	
	$("#disconnect").click(logout);

	authorize();
});