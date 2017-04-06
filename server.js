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
	var filePath = __dirname + '/public/' + newFN + ".html";
	fs.copySync(__dirname + '/ref.html', filePath);
	fs.appendFile(filePath, body, function() {
		file = __dirname + "/public/" + newFNE;
		(async function() {
			const instance = await phantom.create(["--ssl-protocol=any"]);
			const page = await instance.createPage();
			await page.property('viewportSize', {width:1100,height:1100});
			const status = await page.open("http://localhost:3333/public/" + newFN + ".html");
			await new Promise(resolve => {
				setTimeout(() => {
					resolve("");
				}, 3000);
			});
			await page.render(file);
			await new Promise(resolve => {
				setTimeout(() => {
					resolve("");
				}, 1000);
			});
			respond.send("public/" + newFNE);
			await instance.exit();
		})();
	});
});

app.listen(3333);
