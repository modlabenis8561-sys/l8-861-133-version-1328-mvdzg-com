(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function initMobileMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
            toggle.classList.toggle('is-open');
        });
    }

    function initHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function setSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                setSlide(index + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                setSlide(index - 1);
                startTimer();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                setSlide(index + 1);
                startTimer();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var nextIndex = Number(dot.getAttribute('data-hero-dot') || 0);
                setSlide(nextIndex);
                startTimer();
            });
        });
        setSlide(0);
        startTimer();
    }

    function initPlayer() {
        var shell = document.querySelector('.video-shell');
        var video = document.querySelector('#movie-player');
        if (!shell || !video) {
            return;
        }
        var button = shell.querySelector('.player-start');
        var source = shell.getAttribute('data-video-url') || window.__MOVIE_SOURCE__ || '';
        var hlsInstance = null;
        var initialized = false;

        function attachSource() {
            if (!source || initialized) {
                return;
            }
            initialized = true;
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }
        }

        function playVideo() {
            attachSource();
            shell.classList.add('is-playing');
            if (button) {
                button.classList.add('is-hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    if (button) {
                        button.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (button) {
            button.addEventListener('click', playVideo);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            } else {
                video.pause();
            }
        });
        video.addEventListener('play', function () {
            shell.classList.add('is-playing');
            if (button) {
                button.classList.add('is-hidden');
            }
        });
        video.addEventListener('pause', function () {
            if (!video.ended && button) {
                button.classList.remove('is-hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    function createSearchCard(movie) {
        var tags = [movie.year, movie.region, movie.type].filter(Boolean).join(' · ');
        return [
            '<a class="movie-card" href="' + movie.url + '">',
            '    <span class="poster-wrap">',
            '        <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '        <span class="poster-overlay">立即观看</span>',
            '    </span>',
            '    <span class="card-body">',
            '        <strong>' + escapeHtml(movie.title) + '</strong>',
            '        <em>' + escapeHtml(movie.oneLine || '') + '</em>',
            '        <span class="card-meta">' + escapeHtml(tags) + '</span>',
            '    </span>',
            '</a>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function initSearchPage() {
        var results = document.querySelector('[data-search-results]');
        var status = document.querySelector('[data-search-status]');
        var input = document.querySelector('#page-search-input');
        if (!results || !status || !window.MOVIE_SEARCH_DATA) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var keyword = (params.get('q') || '').trim();
        if (input) {
            input.value = keyword;
        }
        if (!keyword) {
            return;
        }
        var lower = keyword.toLowerCase();
        var matched = window.MOVIE_SEARCH_DATA.filter(function (movie) {
            var haystack = [
                movie.title,
                movie.oneLine,
                movie.year,
                movie.region,
                movie.type,
                movie.genre,
                movie.category,
                (movie.tags || []).join(' ')
            ].join(' ').toLowerCase();
            return haystack.indexOf(lower) !== -1;
        }).slice(0, 120);
        status.textContent = matched.length ? '搜索结果：' + keyword : '没有找到匹配影片：' + keyword;
        results.innerHTML = matched.map(createSearchCard).join('');
    }

    ready(function () {
        initMobileMenu();
        initHeroSlider();
        initPlayer();
        initSearchPage();
    });
})();
