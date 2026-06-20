(function() {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function() {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var currentSlide = 0;
    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === currentSlide);
        });
        dots.forEach(function(dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === currentSlide);
        });
    }
    dots.forEach(function(dot) {
        dot.addEventListener('click', function() {
            showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        });
    });
    if (slides.length > 1) {
        setInterval(function() {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    var searchInput = document.querySelector('[data-movie-search]');
    var movieCards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var emptyState = document.querySelector('[data-empty-state]');
    if (searchInput && movieCards.length) {
        searchInput.addEventListener('input', function() {
            var keyword = searchInput.value.trim().toLowerCase();
            var visibleCount = 0;
            movieCards.forEach(function(card) {
                var matched = !keyword || (card.getAttribute('data-search') || '').indexOf(keyword) !== -1;
                card.hidden = !matched;
                if (matched) {
                    visibleCount += 1;
                }
            });
            if (emptyState) {
                emptyState.hidden = visibleCount !== 0;
            }
        });
    }

    function initPlayer(shell) {
        var video = shell.querySelector('video[data-video-url]');
        var button = shell.querySelector('[data-player-button]');
        if (!video || !button) {
            return;
        }
        var hlsInstance = null;
        function attachVideo() {
            if (video.getAttribute('data-ready') === '1') {
                return;
            }
            var url = video.getAttribute('data-video-url');
            if (!url) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    autoStartLoad: true,
                    capLevelToPlayerSize: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
            } else {
                video.src = url;
            }
            video.setAttribute('data-ready', '1');
        }
        function startVideo() {
            attachVideo();
            button.hidden = true;
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function() {
                    button.hidden = false;
                });
            }
        }
        button.addEventListener('click', startVideo);
        video.addEventListener('click', function() {
            if (video.paused) {
                startVideo();
            }
        });
        video.addEventListener('play', function() {
            button.hidden = true;
        });
        video.addEventListener('pause', function() {
            if (!video.ended) {
                button.hidden = false;
            }
        });
        video.addEventListener('ended', function() {
            button.hidden = false;
        });
        window.addEventListener('pagehide', function() {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player-shell]')).forEach(initPlayer);
})();
