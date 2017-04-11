# video-face-detection

Figure out how to stream a local IP camera through a proxy (to avoid CORS/security) issues, 
and serve a static web site from the same localhost:port, so it can be displayed in a web page
and subjected to manipulation by JavaScript -- specifically, for face detection using trackingjs.

# Usage

Install as usual via
`npm install`

Run 
`node index.js`
to run the server, which proxies the video feed and serves the static content, all off the same IP/port.

Load `http://localhost:8080/index.html` in the browser.

The relevant files are then `index.js` (the server) and everything in `dashboard` (the web page).


