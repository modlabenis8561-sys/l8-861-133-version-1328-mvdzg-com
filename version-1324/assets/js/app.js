(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    ready(function () {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var active = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === active);
            });
        }

        if (slides.length) {
            showSlide(0);
            if (prev) {
                prev.addEventListener("click", function () {
                    showSlide(active - 1);
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    showSlide(active + 1);
                });
            }
            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    showSlide(dotIndex);
                });
            });
            window.setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }

        var filterInput = document.querySelector("[data-filter-input]");
        var filterSelect = document.querySelector("[data-filter-select]");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-card"));
        var empty = document.querySelector("[data-search-empty]");

        function applyFilter() {
            if (!cards.length) {
                return;
            }
            var keyword = normalize(filterInput ? filterInput.value : "");
            var category = filterSelect ? filterSelect.value : "all";
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-search"));
                var cardCategory = card.getAttribute("data-category") || "";
                var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchedCategory = category === "all" || cardCategory === category;
                var matched = matchedKeyword && matchedCategory;
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        if (filterInput || filterSelect) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");
            if (query && filterInput) {
                filterInput.value = query;
            }
            if (filterInput) {
                filterInput.addEventListener("input", applyFilter);
            }
            if (filterSelect) {
                filterSelect.addEventListener("change", applyFilter);
            }
            applyFilter();
        }
    });

    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById("moviePlayer");
        var overlay = document.querySelector(".player-overlay");
        var button = document.querySelector("[data-play-button]");
        var hls = null;
        var prepared = false;

        if (!video || !streamUrl) {
            return;
        }

        function attachStream() {
            if (prepared) {
                return Promise.resolve();
            }
            prepared = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                return Promise.resolve();
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                return new Promise(function (resolve) {
                    hls.on(window.Hls.Events.MEDIA_ATTACHED, resolve);
                    window.setTimeout(resolve, 400);
                });
            }
            video.src = streamUrl;
            return Promise.resolve();
        }

        function startPlayback() {
            attachStream().then(function () {
                var result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(function () {});
                }
            });
        }

        function togglePlayback() {
            if (video.paused) {
                startPlayback();
            } else {
                video.pause();
            }
        }

        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                startPlayback();
            });
        }

        if (overlay) {
            overlay.addEventListener("click", function (event) {
                if (event.target === overlay) {
                    startPlayback();
                }
            });
        }

        video.addEventListener("click", togglePlayback);
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        video.addEventListener("pause", function () {
            if (overlay) {
                overlay.classList.remove("is-hidden");
            }
        });
        video.addEventListener("ended", function () {
            if (overlay) {
                overlay.classList.remove("is-hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
