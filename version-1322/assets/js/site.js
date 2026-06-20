
(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuButton = qs('.mobile-menu-button');
    var mobileNav = qs('.mobile-nav');
    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    qsa('.site-search-form').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = qs('input[name="q"]', form);
            var query = input ? input.value.trim() : '';
            var target = './search.html';
            if (query) {
                target += '?q=' + encodeURIComponent(query);
            }
            window.location.href = target;
        });
    });

    var hero = qs('.hero');
    if (hero) {
        var slides = qsa('.hero-slide', hero);
        var dots = qsa('.hero-dot', hero);
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }

        function next() {
            show(current + 1);
        }

        function start() {
            stop();
            timer = window.setInterval(next, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        var prevButton = qs('.hero-prev', hero);
        var nextButton = qs('.hero-next', hero);
        if (prevButton) {
            prevButton.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (nextButton) {
            nextButton.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    var filterBar = qs('.filter-bar');
    if (filterBar) {
        var movieCards = qsa('[data-title]');
        var keywordInput = qs('[data-filter-keyword]', filterBar);
        var yearSelect = qs('[data-filter-year]', filterBar);
        var regionSelect = qs('[data-filter-region]', filterBar);
        var typeSelect = qs('[data-filter-type]', filterBar);
        var empty = qs('.no-results');

        function valueOf(element) {
            return element ? element.value.trim().toLowerCase() : '';
        }

        function applyFilter() {
            var keyword = valueOf(keywordInput);
            var year = valueOf(yearSelect);
            var region = valueOf(regionSelect);
            var type = valueOf(typeSelect);
            var visible = 0;
            movieCards.forEach(function (card) {
                var text = [card.dataset.title, card.dataset.year, card.dataset.region, card.dataset.type].join(' ').toLowerCase();
                var ok = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    ok = false;
                }
                if (year && String(card.dataset.year).toLowerCase() !== year) {
                    ok = false;
                }
                if (region && String(card.dataset.region).toLowerCase() !== region) {
                    ok = false;
                }
                if (type && String(card.dataset.type).toLowerCase() !== type) {
                    ok = false;
                }
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }

        [keywordInput, yearSelect, regionSelect, typeSelect].forEach(function (element) {
            if (element) {
                element.addEventListener('input', applyFilter);
                element.addEventListener('change', applyFilter);
            }
        });
        applyFilter();
    }

    var searchPage = qs('[data-search-page]');
    if (searchPage && Array.isArray(window.SEARCH_MOVIES)) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';
        var searchInput = qs('[data-search-input]');
        var results = qs('[data-search-results]');
        if (searchInput) {
            searchInput.value = q;
        }

        function render(query) {
            var value = (query || '').trim().toLowerCase();
            var list = window.SEARCH_MOVIES.filter(function (movie) {
                if (!value) {
                    return true;
                }
                return [movie.title, movie.year, movie.region, movie.type, movie.category, movie.tags].join(' ').toLowerCase().indexOf(value) !== -1;
            }).slice(0, 120);
            if (!results) {
                return;
            }
            results.innerHTML = list.map(function (movie) {
                return '<article class="movie-card">' +
                    '<a href="' + movie.url + '" class="poster-wrap">' +
                    '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="play-round">▶</span>' +
                    '<span class="year-chip">' + escapeHtml(movie.year) + '</span>' +
                    '</a>' +
                    '<div class="card-body">' +
                    '<a class="card-title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>' +
                    '<p>' + escapeHtml(movie.line) + '</p>' +
                    '<div class="card-meta"><a href="' + movie.categoryUrl + '">' + escapeHtml(movie.category) + '</a><span>' + escapeHtml(movie.region) + '</span></div>' +
                    '</div>' +
                    '</article>';
            }).join('');
        }

        function escapeHtml(text) {
            return String(text).replace(/[&<>"]/g, function (ch) {
                return ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[ch]);
            });
        }

        var searchForm = qs('[data-search-form]');
        if (searchForm) {
            searchForm.addEventListener('submit', function (event) {
                event.preventDefault();
                var query = searchInput ? searchInput.value.trim() : '';
                var url = './search.html';
                if (query) {
                    url += '?q=' + encodeURIComponent(query);
                }
                history.replaceState(null, '', url);
                render(query);
            });
        }
        render(q);
    }
})();
