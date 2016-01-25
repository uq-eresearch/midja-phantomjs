var express = require('express'),
	fs = require('fs-extra'),
	url = require('url'),
	app = express(),
	bodyParser = require("body-parser"),
	cors = require('cors'),
	phantom = require('phantom'),
	_ = require('lodash'),
	shortid = require('shortid'),
	size,
	file;

app.use(bodyParser.json());

app.use('/public', express.static(__dirname + '/public'));  
app.use(express.static(__dirname + '/public')); 
app.use(cors())

app.post('/receive', function(request, respond) {
	console.log("new request");
	var newFN = shortid.generate();
	var body = "var recData = " + JSON.stringify(request.body) + ";if(recData.labelLocations == true) {showLabel();}</script></body></html>";
	var newFNE = newFN + "." + request.body["fileType"];
    	filePath = __dirname + '/public/' + newFN + ".html";
	fs.copySync(__dirname + '/ref.html', filePath);
	fs.appendFile(filePath, body, function() {
		file = __dirname + "/public/" + newFNE;
		phantom.create("--ssl-protocol=any", function(ph) {
			return ph.createPage(function(page) {
				page.set('viewportSize', {width:1100,height:1100});
				return page.open("http://localhost:3333/public/" + newFN + ".html", function(status) {
					setTimeout(function () {
						page.render(file);
						ph.exit();
						setTimeout(function () {
							respond.send("public/" + newFNE);
						}, 1000);						
					}, 3000);
				});
			});
		});
	});
});

app.listen(3333);
