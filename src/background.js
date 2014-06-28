var body = undefined
var suggestions = undefined

var linkPattern = 'a[href^=http], a[href^="/"]'

convertText = function (text) {
	return $('<div/>').html(text)
}

getSuggestions = function (el) {
	return $.makeArray(el.find(linkPattern).map(function (i,el) {
		var name = removeWhitespace($(el).text())
		var href = '' + encodeURI($(el).attr('href'))
		var description = '<url>' + href + '</url>'

		if (name == null || name == "") {
			name = $(el).attr('aria-label')
		}

		if (name) {
			description = name + ' ' + description
		}

		return {
			content: href,
			description: description,
		}
	}))
}

getMatchingLink = function (query, link) {
	var matcher = new RegExp(query, 'gi')
	return link.description.match(matcher)
}

removeWhitespace = function (string) {
	return string.replace(/^\s+(.*)\s+$/g, '').replace(/\s+/g, ' ')
}

searchLinks = function (query) {
	return suggestions.filter(function (link) {
		return getMatchingLink(query, link)
	})
}

chrome.omnibox.onInputStarted.addListener(function () {
	chrome.tabs.getSelected(null, function (tab) {
		chrome.tabs.sendMessage(tab.id, {msg: "getLinks"}, function (text) {
			body = convertText(text)
			suggestions = getSuggestions(body)
		})
	})
})

chrome.omnibox.onInputChanged.addListener(function (query, suggest) {
	var filteredSuggestions = [], first

	if (suggestions && suggestions.length > 0) {
		filteredSuggestions = searchLinks(query)

		if (filteredSuggestions.length > 0) {
			first = filteredSuggestions.shift()
			chrome.omnibox.setDefaultSuggestion({description: first.description})
		}

		suggest(filteredSuggestions)
	}
})

chrome.omnibox.onInputEntered.addListener(function (query) {
	var isContent = false
	var url

	for(var i=suggestions.length-1; i > 0; i--) {
		var link = suggestions[i]
		var match = getMatchingLink(query, link)

		if (link.content === query) {
			url = query
			break
		}
	}

	if (!url) {
		url = searchLinks(query)[0].content
	}

	if (url) {
		chrome.tabs.executeScript({
			code: 'window.location="' + url + '"'
		});
	}
})
