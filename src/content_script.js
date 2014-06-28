if (window == top) {
	// chrome.extension.sendRequest({msg : "showAction"})

	chrome.extension.onMessage.addListener(function(req, sender, sendMessage) {
		switch (req.msg) {
			case "getLinks":
				sendMessage($('<div/>').append($('a').clone()).html())
				break;
		}
	})
}
