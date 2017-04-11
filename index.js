// Compensate for potentially wonky server responses: 
// (See http://stackoverflow.com/questions/36628420/nodejs-request-hpe-invalid-header-token)
process.binding('http_parser').HTTPParser = require('http-parser-js').HTTPParser;

var express = require('express');
var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer({});

DEFAULT_WEB_SERVER_PORT = 8080;

if (process.argv.length < 3)
{
	console.log('Usage: node index.js http://url.to/camera.feed [port to serve on] [cameraUsername:password]');
	console.log('Example: node index.js http://192.168.86.147/videostream.cgi 8090 admin:');
	console.log('Default port: ' + DEFAULT_WEB_SERVER_PORT);
	console.log('Default cameraUsername:password: none');
	process.exit(0);
}

var cameraUrl = process.argv[2];
var urlParts = /^(.*\:\/\/[^\/]*)(\/?.*$)/.exec(cameraUrl);
cameraDomainUrl = urlParts[1];
cameraPath = urlParts[2];

var webServerPort = (process.argv.length > 3) ? process.argv[3] : DEFAULT_WEB_SERVER_PORT;

var credentials, encodedCredentials;
if (process.argv.length > 4)
{
	credentials = process.argv[4];
	encodedCredentials = new Buffer(credentials).toString('base64');
	proxy.on('proxyReq', function (proxyReq, req, res, options) 
	{
  		proxyReq.setHeader('Authorization', 'Basic ' + encodedCredentials);
  	});
}

console.log('Streaming camera video from base URL "' + cameraDomainUrl + 
	'" and path "' + cameraPath + '"' + (encodedCredentials ? ' and credentials' : ' without credentials'));

proxy.on('proxyRes', function (proxyRes, req, res, options) 
{
  proxyRes.headers['Access-Control-Allow-Origin'] = '*'; // CORS
});

var app = express();
app.get(cameraPath, function (req, res)
{
  proxy.web(req, res, {target: cameraDomainUrl});  
});

app.use(express.static('dashboard'))

app.listen(webServerPort, function () 
{
	console.log('Server listening on: ' + webServerPort);
});

// Helpful in debugging:

proxy.on('error', function (err, req, res) 
{
  console.error(err);
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('Something went wrong. And we are reporting a custom error message.');
});

proxy.on('proxyRes', function (proxyRes, req, res) 
{
  console.log('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2));
});

