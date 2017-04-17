function Detector(imgSelector, detectables, gui)
{
  var that = this;

  this.refreshRate = 100; // the default in ms
  this.maxSnapshotRate = 1000; // the default in ms
  this.logging = false;

  var img = document.querySelector(imgSelector);

  var tracker = new tracking.ObjectTracker(detectables);
  tracker.setInitialScale(4);
  tracker.setStepSize(2);
  tracker.setEdgesDensity(0.1);
  //tracker.setStepSize(1.7);
  if (gui)
  {
    gui.add(tracker, 'edgesDensity', 0.1, 0.5).step(0.01);
    gui.add(tracker, 'initialScale', 1.0, 10.0).step(0.1);
    gui.add(tracker, 'stepSize', 1, 5).step(0.1);
  }

  var detect = function detect()
  {
    tracking.track(imgSelector, tracker);
  }

  ///////////////////////////
  // Highlight detected face:

  var rects = []; // The bounding boxes drawn around the detected face

  var drawRect = function drawRect(x, y, w, h) 
  {
    var rect = document.createElement('div');
    document.querySelector('.demo-container').appendChild(rect);
    rect.classList.add('rect');
    rect.w = w;
    rect.style.width = w + 'px';
    rect.h = h;
    rect.style.height = h + 'px';
    rect.style.left = (this.img.offsetLeft + x) + 'px';
    rect.style.top = (this.img.offsetTop + y) + 'px';
    return rect;
  }

  var clearRects = function clearRects()
  {
    rects.forEach(function deleteRect(rect) 
    {
      rect.parentNode.removeChild(rect);
    });
    rects = [];
  }

  //Snapshots will be taken every moment a face is detected, but only 
  // the last one will be held in a buffer, and only when there is something
  // in that buffer will the snapshot interval timer fire the onSnapshot event
  // when it goes off

  var running = false;
  var snapshotInterval;
  var lastSnapshotBuffer = '';

  tracker.on('track', function (event) 
  {
    if (that.logging) console.log('[' + new Date() + '] Looking...');
    clearRects();
    if (event.data.length === 0) 
    {
      // No targets were detected in this frame.
    } 
    else 
    {
      event.data.forEach(function (rect) 
      {
        console.log(
          { 
            edgesDensity: tracker.getEdgesDensity(), 
            initialScale: tracker.getInitialScale(),
            stepSize: tracker.getStepSize()
          });
        rects.push(drawRect(rect.x, rect.y, rect.width, rect.height));
        lastSnapshotBuffer = snapshot(rect);
        if (that.logging) console.log('Grabbed snapshot');
      });
    }
    if (running)
    {
      setTimeout(function () { detect(); }, that.refreshRate);
    }
    
  });

  this.start = function start()
  {
    var that = this;

    running = true;

    detect(); // subsequent detect calls will be setup when detect runs

    snapshotInterval = setInterval(function snapshotIfNeeded()
    {
      if (lastSnapshotBuffer.length && that.onSnapshot)
      {
        if (that.logging) console.log("Displaying snapshot");
        that.onSnapshot(lastSnapshotBuffer);
        lastSnapshotBuffer = '';
      }
    }, this.maxSnapshotRate);

  }

  this.stop = function stop()
  {
    running = false;

    if (snapshotInterval)
    {
      clearInterval(snapshotInterval);
    }
  }

  ///////////////////////////
  // Snapshot the detected face:

  var snapshot = function snapshot(rect)
  {

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    canvas.width = rect.width;
    canvas.height = rect.height;
    context.drawImage(img, rect.x, rect.y, rect.width, rect.height, 
      0, 0, rect.width, rect.height);

    // xExpansion = 0.25;
    // yExpansion = 0.25;
    // effectiveX = Math.max(rect.x - xExpansion * rect.width,  0);
    // effectiveY = Math.max(rect.y - yExpansion * rect.height, 0);
    // effectiveXmax = Math.min(rect.x + rect.width +  xExpansion * rect.width,  img.width);
    // effectiveYmax = Math.min(rect.y + rect.height + yExpansion * rect.height, img.height);
    // effectiveWidth = effectiveXmax  - effectiveX;
    // effectiveHeight = effectiveYmax - effectiveY;
    // console.log(rect.x, rect.y, rect.width, rect.height);
    // console.log('-->', effectiveX, effectiveY, effectiveWidth, effectiveHeight);
    // canvas.width = effectiveWidth;
    // canvas.height = effectiveX;
    // context.drawImage(img, effectiveX, effectiveY, effectiveWidth, effectiveHeight, 
    //   0, 0, effectiveWidth, effectiveHeight);

    var snapshotBase64 = canvas.toDataURL('image/png');
    return snapshotBase64;


  }

}

