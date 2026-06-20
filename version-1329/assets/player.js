function setupMoviePlayer(mediaUrl) {
  var video = document.getElementById('site-player');
  var trigger = document.getElementById('player-start');
  var prepared = false;
  var hlsInstance = null;

  if (!video || !mediaUrl) {
    return;
  }

  function bindMedia() {
    if (prepared) {
      return;
    }
    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = mediaUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(mediaUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = mediaUrl;
  }

  function start() {
    bindMedia();
    if (trigger) {
      trigger.hidden = true;
    }
    var attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {
        if (trigger) {
          trigger.hidden = false;
        }
      });
    }
  }

  if (trigger) {
    trigger.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (!prepared || video.paused) {
      start();
    }
  });

  video.addEventListener('play', function () {
    if (trigger) {
      trigger.hidden = true;
    }
  });

  video.addEventListener('error', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
    prepared = false;
  });
}
