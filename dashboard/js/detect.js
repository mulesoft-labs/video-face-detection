function Detector(imgSelector, detectables)
{

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

  this.start = function start(refreshRate)
  {
    refreshRate = refreshRate || 100; // default is 100ms
    detect(); // subsequent detect calls will be setup when detect runs

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
          snapshot(rect);
        });
      }
      setTimeout(function () { detect(); }, refreshRate);
    });
  }

  ///////////////////////////
  // Snapshot detected face:

  console.log('In definition, img is ', img);
  var snapshot = function snapshot(rect)
  {
    var snapshotBuffer = document.createElement('canvas');
    snapshotBuffer.width = rect.width;
    snapshotBuffer.height = rect.height;
    var context = snapshotBuffer.getContext('2d');
    console.log('In snapshot, img is ', img);
    context.drawImage(img, rect.x, rect.y, rect.width, rect.height, 
      0, 0, img.offsetWidth, img.offsetHeight);
    var snapshotBase64 = snapshotBuffer.toDataURL('image/png');
    if (this.onSnapshot) onSnapshot(snapshotBase64);
  }

}




function onSnapshot(snapshotBase64)
{
  // Display the last 3 snapshots
  containers = Array.from(document.getElementsByClassName('snapshot'));
  for (var i=containers.length-1; i>0; i--)
  {
    containers[i].src = containers[i-1].src;
  }
  containers[0].src = snapshotBase64;
}

