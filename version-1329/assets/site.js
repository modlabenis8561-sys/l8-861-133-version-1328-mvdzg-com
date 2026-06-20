(function () {
  function selectAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function schedule() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        schedule();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        schedule();
      });
    }

    show(0);
    schedule();
  }

  function initImages() {
    selectAll('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('image-hidden');
      }, { once: true });
    });
  }

  function initSearch() {
    var input = document.querySelector('[data-search-input]');
    var results = document.querySelector('[data-search-results]');
    if (!input || !results || !window.MOVIE_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    input.value = query;

    function render(items) {
      if (!items.length) {
        results.innerHTML = '<p class="empty-state">请输入关键词查找影片。</p>';
        return;
      }
      results.innerHTML = items.slice(0, 80).map(function (item) {
        return [
          '<article class="search-result-item">',
          '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">',
          '<div>',
          '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
          '<p>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.genre) + '</p>',
          '<p>' + escapeHtml(item.line) + '</p>',
          '</div>',
          '<a class="primary-button" href="' + item.url + '">观看</a>',
          '</article>'
        ].join('');
      }).join('');
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"]/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[char];
      });
    }

    function search(value) {
      var keyword = String(value || '').trim().toLowerCase();
      if (!keyword) {
        render(window.MOVIE_INDEX.slice(0, 24));
        return;
      }
      var terms = keyword.split(/\s+/).filter(Boolean);
      var matched = window.MOVIE_INDEX.filter(function (item) {
        var text = item.searchText.toLowerCase();
        return terms.every(function (term) {
          return text.indexOf(term) !== -1;
        });
      });
      render(matched);
    }

    input.addEventListener('input', function () {
      search(input.value);
    });
    search(query);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initImages();
    initSearch();
  });
})();
