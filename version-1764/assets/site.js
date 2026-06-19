(function () {
    const mobileButton = document.querySelector('[data-mobile-toggle]');
    const mobilePanel = document.querySelector('[data-mobile-panel]');

    if (mobileButton && mobilePanel) {
        mobileButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    const prev = document.querySelector('[data-hero-prev]');
    const next = document.querySelector('[data-hero-next]');
    let activeSlide = 0;
    let heroTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === activeSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === activeSlide);
        });
    }

    function startHeroTimer() {
        if (heroTimer) {
            clearInterval(heroTimer);
        }
        if (slides.length > 1) {
            heroTimer = setInterval(function () {
                showSlide(activeSlide + 1);
            }, 5000);
        }
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
            showSlide(dotIndex);
            startHeroTimer();
        });
    });

    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(activeSlide - 1);
            startHeroTimer();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(activeSlide + 1);
            startHeroTimer();
        });
    }

    startHeroTimer();

    const filterArea = document.querySelector('[data-filter-area]');
    const cardList = document.querySelector('[data-card-list]');

    if (filterArea && cardList) {
        const searchInput = filterArea.querySelector('[data-card-search]');
        const yearFilter = filterArea.querySelector('[data-year-filter]');
        const categoryFilter = filterArea.querySelector('[data-category-filter]');
        const sortFilter = filterArea.querySelector('[data-sort-filter]');
        const countOutput = filterArea.querySelector('[data-filter-count]');
        const cards = Array.from(cardList.querySelectorAll('[data-movie-card]'));
        const urlParams = new URLSearchParams(window.location.search);
        const queryValue = urlParams.get('q') || '';

        if (searchInput && queryValue) {
            searchInput.value = queryValue;
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function updateCards() {
            const keyword = normalize(searchInput ? searchInput.value : '');
            const year = yearFilter ? yearFilter.value : '';
            const category = categoryFilter ? categoryFilter.value : '';
            let visible = 0;

            cards.forEach(function (card) {
                const haystack = normalize([
                    card.dataset.title,
                    card.dataset.tags,
                    card.dataset.category,
                    card.dataset.year
                ].join(' '));
                const yearOk = !year || card.dataset.year === year;
                const categoryOk = !category || card.dataset.category === category;
                const keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
                const show = yearOk && categoryOk && keywordOk;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });

            if (countOutput) {
                countOutput.textContent = visible + ' 部';
            }
        }

        function sortCards() {
            const mode = sortFilter ? sortFilter.value : 'default';
            const sorted = cards.slice().sort(function (a, b) {
                if (mode === 'new') {
                    return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                }
                if (mode === 'old') {
                    return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
                }
                if (mode === 'title') {
                    return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
                }
                return cards.indexOf(a) - cards.indexOf(b);
            });
            sorted.forEach(function (card) {
                cardList.appendChild(card);
            });
            updateCards();
        }

        [searchInput, yearFilter, categoryFilter].forEach(function (item) {
            if (item) {
                item.addEventListener('input', updateCards);
                item.addEventListener('change', updateCards);
            }
        });

        if (sortFilter) {
            sortFilter.addEventListener('change', sortCards);
        }

        updateCards();
    }

    function attachStream(video, stream) {
        if (video.dataset.ready === '1') {
            return;
        }
        video.dataset.ready = '1';
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            video._hls = hls;
            return;
        }
        video.src = stream;
    }

    document.querySelectorAll('[data-player]').forEach(function (player) {
        const video = player.querySelector('video');
        const trigger = player.querySelector('[data-play-trigger]');
        if (!video || !trigger) {
            return;
        }
        const stream = video.dataset.stream;
        const play = function () {
            if (!stream) {
                return;
            }
            attachStream(video, stream);
            trigger.classList.add('hidden');
            video.controls = true;
            const attempt = video.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {
                    trigger.classList.remove('hidden');
                });
            }
        };
        trigger.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            trigger.classList.add('hidden');
        });
        video.addEventListener('pause', function () {
            if (video.currentTime === 0 || video.ended) {
                trigger.classList.remove('hidden');
            }
        });
    });
})();
