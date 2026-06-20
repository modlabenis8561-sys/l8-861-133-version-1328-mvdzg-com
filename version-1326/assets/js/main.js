(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function text(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function bindMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function bindHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var active = 0;
        function show(index) {
            active = index % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
            });
        });
        show(0);
        window.setInterval(function () {
            show(active + 1);
        }, 5200);
    }

    function bindCardSearch() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-card-scope]"));
        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-card-search]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
            var empty = scope.querySelector("[data-empty-state]");
            var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-value]"));
            var select = scope.querySelector("[data-select-filter]");
            var params = new URLSearchParams(window.location.search);
            var urlKeyword = params.get("q") || "";
            if (input && urlKeyword) {
                input.value = urlKeyword;
            }
            var activeFilter = "all";
            function apply() {
                var keyword = input ? text(input.value) : "";
                var selectValue = select ? select.value : "all";
                var shown = 0;
                cards.forEach(function (card) {
                    var haystack = text(card.textContent);
                    var filterText = text(card.getAttribute("data-filter") || "");
                    var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchesButton = activeFilter === "all" || filterText.indexOf(activeFilter) !== -1;
                    var matchesSelect = selectValue === "all" || filterText.indexOf(text(selectValue)) !== -1;
                    var visible = matchesKeyword && matchesButton && matchesSelect;
                    card.style.display = visible ? "" : "none";
                    if (visible) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", shown === 0);
                }
            }
            if (input) {
                input.addEventListener("input", apply);
            }
            if (select) {
                select.addEventListener("change", apply);
            }
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    activeFilter = text(button.getAttribute("data-filter-value"));
                    buttons.forEach(function (item) {
                        item.classList.toggle("is-active", item === button);
                    });
                    apply();
                });
            });
            apply();
        });
    }

    window.setupMoviePlayer = function (url) {
        var shell = document.querySelector("[data-player-shell]");
        var video = document.querySelector("[data-player-video]");
        var layer = document.querySelector("[data-play-layer]");
        var button = document.querySelector("[data-play-button]");
        if (!shell || !video || !url) {
            return;
        }
        var loaded = false;
        function load() {
            if (loaded) {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls();
                hls.loadSource(url);
                hls.attachMedia(video);
                video.hlsObject = hls;
            } else {
                video.src = url;
            }
            loaded = true;
        }
        function start(event) {
            if (event) {
                event.preventDefault();
            }
            load();
            if (layer) {
                layer.classList.add("is-hidden");
            }
            var action = video.play();
            if (action && action.catch) {
                action.catch(function () {});
            }
        }
        if (layer) {
            layer.addEventListener("click", start);
        }
        if (button) {
            button.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
    };

    ready(function () {
        bindMenu();
        bindHero();
        bindCardSearch();
    });
}());
