function Detector(imgSelector, detectables)
{

  this.refreshRate = 100; // the default in ms
  this.maxSnapshotRate = 1000; // the default in ms

  var img = document.querySelector(imgSelector);

  var tracker = new tracking.ObjectTracker(detectables);
  tracker.setInitialScale(4);
  tracker.setStepSize(2);
  tracker.setEdgesDensity(0.1);
  //tracker.setStepSize(1.7);

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
    rect.style.width = w + 'px';
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

  var running = false;
  var snapshotInterval;
  var lastSnapshotBuffer;

  tracker.on('track', function (event) 
  {
    console.log('[' + new Date() + '] Looking...');
    clearRects();
    if (event.data.length === 0) 
    {
      // No targets were detected in this frame.
      // console.log('Detected nothing in ', event);
    } 
    else 
    {
      // console.log('Detected!');
      event.data.forEach(function (rect) 
      {
        rects.push(drawRect(rect.x, rect.y, rect.width, rect.height));
        lastSnapshotBuffer = snapshot(rect);
      });
    }
    if (running)
    {
      setTimeout(function () { detect(); }, this.refreshRate);
    }
    
  });

  this.start = function start()
  {
    running = true;

    detect(); // subsequent detect calls will be setup when detect runs

    snapshotInterval = setInterval(function snapshotIfNeeded()
    {
      if (lastSnapshotBuffer && this.onSnapshot)
      {
        this.onSnapshot(lastSnapshotBuffer);
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
  // Snapshot detected face:

  var snapshot = function snapshot(rect)
  {
    var snapshotBuffer = document.createElement('canvas');
    snapshotBuffer.width = rect.width;
    snapshotBuffer.height = rect.height;
    var context = snapshotBuffer.getContext('2d');
    context.drawImage(img, rect.x, rect.y, rect.width, rect.height, 
      0, 0, img.offsetWidth, img.offsetHeight);
    var snapshotBase64 = snapshotBuffer.toDataURL('image/png');
    return snapshotBase64;
  }

}

