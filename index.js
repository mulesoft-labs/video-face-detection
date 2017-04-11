var express = require('express');
var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer({});

proxy.on('proxyReq', function(proxyReq, req, res, options) {
  proxyReq.setHeader('Authorization', 'Basic YWRtaW46'); // base64 encoding of admin: (note trailing colon)
});

proxy.on('proxyRes', function(proxyRes, req, res, options) {
  proxyRes.headers['Access-Control-Allow-Origin'] = '*'; // CORS
});

DEFAULT_WEB_SERVER_PORT = 8080;

if (process.argv.length < 3)
{
	console.log('Usage: node index.js http://url.to/camera.feed [port to serve on]');
	console.log('Example: node index.js http://192.168.86.147/videostream.cgi 8090');
	console.log('Default port: ' + DEFAULT_WEB_SERVER_PORT);
	process.exit(0);
}

var cameraUrl = process.argv[2];
var urlParts = /^(.*\:\/\/[^\/]*)(\/?.*$)/.exec(cameraUrl);
cameraDomainUrl = urlParts[1];
cameraPath = urlParts[2];
console.log('Streaming camera video from base URL "' + cameraDomainUrl + 
	'"" and path "' + cameraPath + '"');

var webServerPort = (process.argv.length > 3) ? process.argv[3] : DEFAULT_WEB_SERVER_PORT;

var app = express();
app.get(cameraPath, function(req, res){
  proxy.web(req, res, {target: cameraDomainUrl});  
});

app.use(express.static('dashboard'))

app.listen(webServerPort, function () {
    console.log('Server listening on: ' + webServerPort);
  });

// Helpful in debugging:

proxy.on('error', function (err, req, res) {
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });
  res.end('Something went wrong. And we are reporting a custom error message.');
});

// proxy.on('proxyRes', function (proxyRes, req, res) {
//   console.log('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2));
// });

// proxy.on('open', function (proxySocket) {
//   // listen for messages coming FROM the target here
//   proxySocket.on('data', hybiParseAndLogMessage);
// });

// proxy.on('close', function (res, socket, head) {
//   // view disconnected websocket connections
//   console.log('Client disconnected');
// });

