(function() {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function initNavigation() {
    var toggle = one('.nav-toggle');
    var menu = one('.mobile-nav');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function() {
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var slides = all('[data-hero-slide]');
    var dots = all('[data-hero-dot]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        show(i);
      });
    });
    setInterval(function() {
      show(index + 1);
    }, 5200);
  }

  function initFiltering() {
    var input = one('[data-filter-input]');
    var year = one('[data-filter-year]');
    var cards = all('.movie-card[data-title]');
    if (!input || !cards.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      input.value = query;
    }
    function apply() {
      var term = input.value.trim().toLowerCase();
      var chosenYear = year ? year.value : '';
      cards.forEach(function(card) {
        var content = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' ').toLowerCase();
        var okText = !term || content.indexOf(term) !== -1;
        var okYear = !chosenYear || card.getAttribute('data-year') === chosenYear;
        card.classList.toggle('hidden', !(okText && okYear));
      });
    }
    input.addEventListener('input', apply);
    if (year) {
      year.addEventListener('change', apply);
    }
    apply();
  }

  window.setupMoviePlayer = function(source) {
    var video = one('[data-player-video]');
    var cover = one('[data-player-cover]');
    var button = one('[data-player-button]');
    if (!video || !source) {
      return;
    }
    function attach() {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (video.getAttribute('src') !== source) {
          video.setAttribute('src', source);
        }
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        if (!video.__player) {
          var player = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          player.loadSource(source);
          player.attachMedia(video);
          video.__player = player;
        }
        return;
      }
      if (video.getAttribute('src') !== source) {
        video.setAttribute('src', source);
      }
    }
    function play() {
      attach();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.setAttribute('controls', 'controls');
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function() {});
      }
    }
    attach();
    if (button) {
      button.addEventListener('click', play);
    }
    if (cover && cover !== button) {
      cover.addEventListener('click', play);
    }
    video.addEventListener('click', function() {
      if (video.paused) {
        play();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initHero();
    initFiltering();
  });
})();
