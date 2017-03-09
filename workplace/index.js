module.exports = Franz => {
	console.log(Franz)
	var webViewEl = document.getElementById("webview"); 
	console.log(webViewEl)
	webViewEl.addEventListener("did-get-response-details", function(details) {
	  console.log(details); 
	});

	return Franz;
};
