var tab;
chrome.tabs.getSelected(null,function(currenttab){
	tab = currenttab;
});

var onAuthorize = function() {
	var rev_highest = 0;
	var board_highest = {};
	Trello.get('members/me/boards', function(data) {
		$.each(data, function(idx, board) {
			var rev = parseInt(board.name.replace(/[^\d]+/,''),10);
			if(typeof rev === 'number' && rev > rev_highest){
				rev_highest = rev;
				board_highest = $.extend(true,{},board);
			}
		});  

		Trello.get('board/' + board_highest.id + '?lists=all', function(data) {
			var list_id = data.lists[0].id;

			Trello.post('cards?name=' + encodeURIComponent(tab.title) + '&desc=' + encodeURIComponent(tab.url) + '&idList=' + list_id, function(data) {
				$('#message').html('A card named <b>' + tab.title + '</b> has been successfully created in board <b>' + board_highest.name + '</b>');
			});
		});
	});
};

var authorize = function(){
	if(typeof Trello === 'undefined'){
		$('#message').html('Waiting on the Trello API...');
		window.setTimeout(function(){
			authorize();
		},200);
	}
	else {
		if(localStorage['auth'] == '1')
		{
			Trello.authorize({
				interactive: false,
				scope: {
					read: true,
					write: true,
					account: false
				},
				success: function() {
					onAuthorize();
				}
			});
		}
		else
		{
			$('#message').html('<a href="' + chrome.extension.getURL('options.html') + '" target="_blank">Connect to Trello</a>');
		}
	}
}

$(document).ready(function(){
	$(document).on('submit','form',function(e){
		e.preventDefault();
		
		var apikey = $('input').val();
		if(apikey){
			localStorage['apikey'] = apikey;
	
			$.getScript('https://api.trello.com/1/client.js?key=' + localStorage['apikey'], function() {
				authorize();
			});
		}
	});
	
	if(typeof localStorage['apikey'] !== 'string')
	{
		$('#message').html('<form action="."><label>Enter your <a href="https://trello.com/1/appKey/generate" target="_blank">Trello Key</a>: <input name="key"></label><button type="submit">OK</button></form>');
	}
	else {
		$.getScript('https://api.trello.com/1/client.js?key=' + localStorage['apikey'], function() {
			authorize();
		});
	}
});
