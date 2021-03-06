
var updateTab = function(tab) {
	//alert ("update!");
	if (!/http(.+)xiami\.com/.test(tab.url)) return;	
	
	chrome.tabs.executeScript(tab.id, {
		file : "render.js",
		runAt: "document_start"
	}, function() {});
	
	chrome.storage.sync.get(null, function (data) {		
		if (data.Mode != "false") {				
		} else {	
		// Xiamini OFF
			// remove JS in player page
			if (/play?/.test(tab.url)) 	
				chrome.tabs.executeScript(tab.id, {
					file : "Collections-off.js",
					runAt: "document_start"
				}, function() {});
		}
	});
};

var updateAfterComplete = function(tab) {
	chrome.storage.sync.get(null, function (data) {
		if (data.Mode != "false") {
		// Xiamini ON
			// render JS in player page
			if (/play?/.test(tab.url)) {
				chrome.tabs.executeScript(tab.id, {
					file : "lyricscontrol.js",
					runAt: "document_end"
				}, function() {});	
			}
			// render JS in group page
			if (/thread\-/.test(tab.url)) 
				chrome.tabs.executeScript(tab.id, {
					file : "hidereply.js",
					runAt: "document_end"
				}, function() {});
			
			// render 320k notes, wormholes in album page
			if (/album/.test(tab.url)) {
				chrome.tabs.executeScript(tab.id, {
					file : "320k.js",
					runAt: "document_start"
				}, function() {});
			}
			
			// render translation posts / album tracklist in song page
			if (/com\/song/.test(tab.url)) {
				chrome.tabs.executeScript(tab.id, {
					file : "translist.js",
					runAt: "document_start"
				}, function() {});
				chrome.tabs.executeScript(tab.id, {
					file : "albumsong.js",
					runAt: "document_start"
				}, function() {});		
			}
			
			//if (/*classical set*/) 
			if (/com\/album|com\/song|com\/artist/.test(tab.url)) 
				chrome.tabs.executeScript(tab.id, {
					file : "classical.js",
					runAt: "document_start"
				}, function() {});	
			
			//if (/*lyrics set*/1)
			if (/com\/song|com\/u\//.test(tab.url))
				chrome.tabs.executeScript(tab.id, {
					file : "lyricsmember.js",
					runAt: "document_start"
				}, function() {});
				
			if ( (tab.url.indexOf("collect/552436") != -1) || (/com\/album|com\/song|com\/collect/.test(tab.url) && data.Wormhole) ) {
				chrome.tabs.executeScript(tab.id, {
					file : "wormhole.js",
					runAt: "document_start"
				}, function() {});		
			}
		}
	});
};


chrome.tabs.getAllInWindow(function(tabs) {
  tabs.forEach(updateTab);
});

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
		if (details.url.indexOf("player") != -1)
			return {redirectUrl: chrome.extension.getURL('player.js')};
		else
			return {redirectUrl: details.url};
    },
    {
        urls: [
            "http://g.tbcdn.cn/de/music-player/*min.js",
        ],
        types: ["script"]
    },
    ["blocking"]
); 


chrome.webRequest.onBeforeSendHeaders.addListener(
	function (details) {
		
		if ((details.url.indexOf('music.126.net') != -1)) {
			alert(details.url);
			for (var i = 0; i < details.requestHeaders.length; ++i) {
				if (details.requestHeaders[i].name === 'Referer') {
					details.requestHeaders[i].value = '';
					break;
				}
			}
		}
		else if ((details.url.indexOf('tyst.migu.cn') != -1)) {
			alert(details.url);
		}
		else if ((details.url.indexOf('imusicapp.cn') != -1)) {
			alert(details.url);
			for (var i = 0; i < details.requestHeaders.length; ++i) {
				if (details.requestHeaders[i].name === 'Referer') {
					details.requestHeaders[i].value = 'http://music.163.com/';
					break;
				}
			}
		}
		else if (details.url.indexOf('qqmusic.qq.com') != -1) {
			alert(details.url);
			for (var i = 0; i < details.requestHeaders.length; ++i) {
				if (details.requestHeaders[i].name === 'Referer') {
					details.requestHeaders[i].value = '';
					break;
				}
			}
		}
	return {
		requestHeaders : details.requestHeaders
	};

}, {
	urls : ["http://*.music.126.net/*mp3", "http://*.qqmusic.qq.com/*m4a*", "http://*.imusicapp.cn/*.mp3*", "http://*.migu.cn/*.mp3*"]
},
	["blocking", "requestHeaders"]);
	
	
chrome.extension.onMessage.addListener(function(req) {
	// if (req.indexOf("alert") != -1) {
		// alert(req);
		// XiaminiNoti(req);
	// }
	// else
		chrome.tabs.getAllInWindow(function(tabs) {
			tabs.forEach(updateTab);
		});
});

chrome.tabs.onUpdated.addListener(function(id, data, tab) {
	updateTab(tab);
	if (data.status == "complete") 
		updateAfterComplete(tab);	
});
