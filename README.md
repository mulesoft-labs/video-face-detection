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

# Configure ffserver for RTSP to MJPEG transcoding

Install ffmpeg and ffserver using brew
`brew install ffmpeg`

Create the ffserver configuration file
`sudo vi /etc/ffserver.conf`

Enter the following contents into ffserver.conf
```cat /etc/ffserver.conf
HTTPPort 8888
HTTPBindAddress 0.0.0.0
MaxHTTPConnections 4000
MaxClients 1000
MaxBandwidth 10000000
CustomLog -

<Feed feed1.ffm>
   File /tmp/feed1.ffm
   FileMaxSize 40M
   Launch ffmpeg -i "rtsp://CAMERA_IP:8554/11"
</Feed>

<Stream ipcam.mjpeg>
   Feed feed1.ffm
   Format mpjpeg
   VideoBitRate 1024
   VideoFrameRate 15
   VideoSize 1280x720
   VideoIntraOnly
   NoAudio
   Strict -1
   NoDefaults
</Stream>
```

Start ffserver
`ffserver`

Test
`http://localhost:8888/ipcam.mjpeg`
