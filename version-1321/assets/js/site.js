(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = selectAll('.hero-slide', hero);
    var dots = selectAll('.hero-dot', hero);
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function nextSlide() {
      showSlide(current + 1);
    }

    function startTimer() {
      timer = window.setInterval(nextSlide, 5000);
    }

    function resetTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      startTimer();
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        resetTimer();
      });
    });

    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        resetTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        resetTimer();
      });
    }

    showSlide(0);
    startTimer();
  }

  var filterInput = document.querySelector('[data-card-search]');
  var filterSelects = selectAll('[data-filter-select]');
  var cards = selectAll('[data-movie-card]');

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var activeFilters = {};

    filterSelects.forEach(function (select) {
      if (select.value) {
        activeFilters[select.getAttribute('data-filter-select')] = select.value;
      }
    });

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search-text') || '').toLowerCase();
      var visible = !query || text.indexOf(query) !== -1;

      Object.keys(activeFilters).forEach(function (key) {
        if (card.getAttribute('data-' + key) !== activeFilters[key]) {
          visible = false;
        }
      });

      card.style.display = visible ? '' : 'none';
    });
  }

  if (filterInput || filterSelects.length) {
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get('q');

    if (filterInput && queryValue) {
      filterInput.value = queryValue;
    }

    if (filterInput) {
      filterInput.addEventListener('input', applyFilters);
    }

    filterSelects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });

    applyFilters();
  }

  var playerShell = document.querySelector('[data-player]');

  if (playerShell) {
    var video = playerShell.querySelector('video');
    var layer = playerShell.querySelector('[data-player-layer]');
    var streamUrl = playerShell.getAttribute('data-stream');
    var loaded = false;

    function attachStream() {
      if (!video || !streamUrl || loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function beginPlayback() {
      attachStream();

      if (layer) {
        layer.classList.add('is-hidden');
      }

      if (video) {
        var action = video.play();

        if (action && typeof action.catch === 'function') {
          action.catch(function () {});
        }
      }
    }

    if (layer) {
      layer.addEventListener('click', beginPlayback);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          beginPlayback();
        }
      });

      video.addEventListener('play', function () {
        if (layer) {
          layer.classList.add('is-hidden');
        }
      });
    }
  }
})();
