(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function text(value) {
        return String(value || '').toLowerCase();
    }

    function esc(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function cardTemplate(item) {
        const tags = Array.isArray(item.tags) ? item.tags.slice(0, 3) : [];
        return '<article class="movie-card">' +
            '<a class="movie-cover" href="' + esc(item.href) + '" aria-label="' + esc(item.title) + '">' +
            '<img src="' + esc(item.image) + '" alt="' + esc(item.title) + '" loading="lazy">' +
            '<span class="cover-play">▶</span>' +
            '</a>' +
            '<div class="movie-card-body">' +
            '<div class="movie-meta-line"><span>' + esc(item.year) + '</span><span>' + esc(item.region) + '</span><span>' + esc(item.type) + '</span></div>' +
            '<h3><a href="' + esc(item.href) + '">' + esc(item.title) + '</a></h3>' +
            '<p>' + esc(item.oneLine) + '</p>' +
            '<div class="tag-row">' + tags.map(function (tag) { return '<span>' + esc(tag) + '</span>'; }).join('') + '</div>' +
            '</div>' +
            '</article>';
    }

    ready(function () {
        const menuButton = document.querySelector('[data-menu-button]');
        const mobilePanel = document.querySelector('[data-mobile-panel]');
        if (menuButton && mobilePanel) {
            menuButton.addEventListener('click', function () {
                menuButton.classList.toggle('is-open');
                mobilePanel.classList.toggle('is-open');
            });
        }

        const hero = document.querySelector('[data-hero]');
        if (hero) {
            const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
            const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
            const prev = hero.querySelector('[data-hero-prev]');
            const next = hero.querySelector('[data-hero-next]');
            let index = 0;
            let timer = null;
            function show(target) {
                if (!slides.length) {
                    return;
                }
                index = (target + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle('is-active', i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle('is-active', i === index);
                });
            }
            function start() {
                stop();
                timer = setInterval(function () {
                    show(index + 1);
                }, 5000);
            }
            function stop() {
                if (timer) {
                    clearInterval(timer);
                    timer = null;
                }
            }
            if (prev) {
                prev.addEventListener('click', function () {
                    show(index - 1);
                    start();
                });
            }
            if (next) {
                next.addEventListener('click', function () {
                    show(index + 1);
                    start();
                });
            }
            dots.forEach(function (dot, i) {
                dot.addEventListener('click', function () {
                    show(i);
                    start();
                });
            });
            hero.addEventListener('mouseenter', stop);
            hero.addEventListener('mouseleave', start);
            show(0);
            start();
        }

        document.querySelectorAll('[data-card-filter]').forEach(function (panel) {
            const input = panel.querySelector('[data-filter-input]');
            const clear = panel.querySelector('[data-filter-clear]');
            const section = panel.nextElementSibling;
            const list = section ? section.querySelector('[data-filter-list]') : null;
            const cards = list ? Array.from(list.querySelectorAll('.movie-card')) : [];
            let typeValue = '';
            let regionValue = '';
            function apply() {
                const keyword = text(input ? input.value : '');
                cards.forEach(function (card) {
                    const content = text([
                        card.dataset.title,
                        card.dataset.year,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.genre,
                        card.dataset.tags
                    ].join(' '));
                    const okKeyword = !keyword || content.indexOf(keyword) !== -1;
                    const okType = !typeValue || card.dataset.type === typeValue;
                    const okRegion = !regionValue || card.dataset.region === regionValue;
                    card.style.display = okKeyword && okType && okRegion ? '' : 'none';
                });
            }
            panel.querySelectorAll('[data-filter-type]').forEach(function (button) {
                button.addEventListener('click', function () {
                    typeValue = typeValue === button.dataset.filterType ? '' : button.dataset.filterType;
                    panel.querySelectorAll('[data-filter-type]').forEach(function (item) {
                        item.classList.toggle('is-active', item.dataset.filterType === typeValue);
                    });
                    apply();
                });
            });
            panel.querySelectorAll('[data-filter-region]').forEach(function (button) {
                button.addEventListener('click', function () {
                    regionValue = regionValue === button.dataset.filterRegion ? '' : button.dataset.filterRegion;
                    panel.querySelectorAll('[data-filter-region]').forEach(function (item) {
                        item.classList.toggle('is-active', item.dataset.filterRegion === regionValue);
                    });
                    apply();
                });
            });
            if (input) {
                input.addEventListener('input', apply);
            }
            if (clear) {
                clear.addEventListener('click', function () {
                    if (input) {
                        input.value = '';
                    }
                    typeValue = '';
                    regionValue = '';
                    panel.querySelectorAll('.is-active').forEach(function (item) {
                        item.classList.remove('is-active');
                    });
                    apply();
                });
            }
        });

        const results = document.querySelector('[data-search-results]');
        const searchInput = document.querySelector('[data-search-input]');
        const searchForm = document.querySelector('[data-search-form]');
        const searchStatus = document.querySelector('[data-search-status]');
        if (results && searchInput && searchForm && Array.isArray(window.SEARCH_DATA)) {
            const params = new URLSearchParams(window.location.search);
            const initial = params.get('q') || '';
            searchInput.value = initial;
            function render() {
                const keyword = text(searchInput.value).trim();
                if (!keyword) {
                    results.innerHTML = '';
                    if (searchStatus) {
                        searchStatus.textContent = '输入关键词开始搜索';
                    }
                    return;
                }
                const matched = window.SEARCH_DATA.filter(function (item) {
                    return text([
                        item.title,
                        item.year,
                        item.region,
                        item.type,
                        item.genre,
                        item.category,
                        Array.isArray(item.tags) ? item.tags.join(' ') : '',
                        item.oneLine
                    ].join(' ')).indexOf(keyword) !== -1;
                }).slice(0, 120);
                results.innerHTML = matched.map(cardTemplate).join('');
                if (searchStatus) {
                    searchStatus.textContent = matched.length ? '为你找到相关影片' : '暂无匹配结果';
                }
            }
            searchForm.addEventListener('submit', function (event) {
                event.preventDefault();
                const url = new URL(window.location.href);
                const value = searchInput.value.trim();
                if (value) {
                    url.searchParams.set('q', value);
                } else {
                    url.searchParams.delete('q');
                }
                window.history.replaceState({}, '', url.toString());
                render();
            });
            searchInput.addEventListener('input', render);
            render();
        }
    });
}());
