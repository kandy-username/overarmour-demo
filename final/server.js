/**
* This is a very simple static web server.
* You can start the server by using the following command line
* node server.js
* You can use the options
* --port -p XXXX To specify a port (default 3000)
* --base -b basePath To specify a base path (relative to current)
* ie: node server.js --port 8888 --base public
**/

var express = require("express");
var app = express();
var argv = require("yargs").argv;
var https = require('https');
var http = require('http');

var debug = argv._.indexOf("debug") > -1;
var port = process.env.PORT || argv.port || argv.p || 3000;
var basePath = argv.base || argv.b || "";
basePath = (basePath.substr(0,1) === "/") ? basePath : "/" + basePath;
basePath += "/";
// OPTIONS
//var config = {
//	host_url:'api.kandy.io',
//	main_path:'/v1.2/domains/',
//	domain:{
//		api_key:'DAKd9019f20a20543469b29ea6051d81efa',
//		api_secret:'DASa8f1adc075e4446b9f2f27bfad58e3a4'
//	}
//};
// url to get domain access token
// https:// api.kandy.io/v1.1/domains/accesstokens?key=api_key&domain_api_secret=api_secret
var domain_access_token_options = {
	host: config.host_url,
	port: 443,
	path: config.main_path + 'accesstokens?key=' + config.domain.api_key + '&domain_api_secret=' + config.domain.api_secret,
	headers: {
		'Content-Type': 'application/json'
	}
};
//var anonymous_user_options = {
//	host: config.host_url,
//	port: 443,
//	path: config.main_path + 'users/user/anonymous?key='+config.domain.api_key,
//	headers: {
//		'Content-Type': 'application/json'
//	}
//};
app.use(express.static(__dirname + basePath));

//Routes
app.get('/domain-access-token', function(req, res) {
	// 1- Get domain access token
		//	get_domain_access_token(domain_access_token_options , res);
	
	// 2- Get anonymous user using this token
		// UDPATE: for now (4/13/2015) getting anonymous user is working with api key not domain access token as JF mentionned
		// we will get anonoymous user directly using key for now


	//get_anonoymous_user(anonymous_user_options , res);
});
function get_domain_access_token(options , res){
	https.get(options, function(resp) {
		resp.setEncoding('utf8');
		var completeResponse = '';
		resp.on('data', function (chunk) {
			completeResponse += chunk;
		});
		resp.on('end', function(chunk) {
			res.send(completeResponse);
		});
	}).on('error', function(e) {
	  console.log("Got error: " + e.message);
	});
}
function get_anonoymous_user(options , res){
	console.log("get_anonoymous_user");
	https.get(options, function(resp) {
		resp.setEncoding('utf8');
		var completeResponse = '';
		resp.on('data', function (chunk) {
			completeResponse += chunk;
		});
		resp.on('end', function(chunk) {
			res.send(completeResponse);
		});
	}).on('error', function(e) {
	  console.log("Got error: " + e.message);
	});
}

app.listen(port);
console.log("Server listening on port " + port + ", serving folder " + basePath);
