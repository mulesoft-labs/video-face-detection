var express = require('express');
var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer({
});

proxy.on('proxyReq', function(proxyReq, req, res, options) {
  proxyReq.setHeader('Authorization', 'Basic YWRtaW46'); // base64 encoding of admin: (note trailing colon)
});

proxy.on('proxyRes', function(proxyRes, req, res, options) {
  proxyRes.headers['Access-Control-Allow-Origin'] = '*'; // CORS
});

CAMERA_DOMAIN_URL = 'http://192.168.86.147'; // Of the form http://192.168.86.147
CAMERA_PATH = '/videostream.cgi';            // Of the form '/videostream.cgi'
WEB_SERVER_PORT = 8080;

var app = express();
app.get(CAMERA_PATH, function(req, res){
  proxy.web(req, res, {target: CAMERA_DOMAIN_URL});  
});

app.use(express.static('dashboard'))

app.listen(WEB_SERVER_PORT, function () {
    console.log('Server listening on: ' + WEB_SERVER_PORT);
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

