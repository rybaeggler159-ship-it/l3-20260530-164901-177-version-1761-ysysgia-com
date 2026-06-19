import { H as Hls } from "./hls-vendor-dru42stk.js";

const m3u8Sources = [
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/77ae15566dde5cfb920bae4712a38399/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/41cb67b47a3668efaea014219666e659/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/31227358d3c181b7168e28ad248cfb4e/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/bd8bf2d0dfea08a2fca51e64c894c4f0/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/c2e5fea7c86e35e5f6e5df5d9aaff7a9/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/c0870c4bc8fd7dcbbeef24fdc5b10706/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/c45bcbf8ca61cccab8e3e1e3f3e6af48/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/9fa382e01c2bd9fecbd21d5c281e4f2e/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/70cc74ebf6fd3a83d75a24f3e4fc4cea/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/71fc4955d3d6d9d6bbc31ca96d9fc71e/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/de12fa8ecef6f03ce38b4bca88d4e5ed/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/79d16e88f36ce3fffe0a0f1bf12d2ff4/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/9cb5f22b7ab050d7eb74e7a7ebfaa6d5/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/e0c2f1b3b5cffa52ad0e78dd699f25f0/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/d0fb89fc6e75ae70ec5d0f7dd20f0d7c/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/8a0e1b11d1e5a7f7d8e06c9a72f3e9c7/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/8f7a9eef6d1faebcf70a0e5eebec6f05/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/a7c0ebca1b4c8e0bce1d3fceb6bbe3d0/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/f9e7cf8fc2e7e7e77a1cbdedb0adbd8d/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/b6e7de6fc4f5caf3abefdca5fdc5e7f9/manifest/video.m3u8"
];

function ready(callback) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
    } else {
        callback();
    }
}

ready(() => {
    setupMobileMenu();
    setupSearchForms();
    setupHeroCarousel();
    setupFilters();
    setupPlayers();
});

function setupMobileMenu() {
    const button = document.querySelector("[data-mobile-menu-button]");
    const menu = document.querySelector("[data-mobile-menu]");

    if (!button || !menu) {
        return;
    }

    button.addEventListener("click", () => {
        menu.classList.toggle("is-open");
    });
}

function setupSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach((form) => {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const input = form.querySelector("input[name='q']");
            const query = input ? input.value.trim() : "";
            const target = form.dataset.searchUrl || "search.html";
            const url = query ? `${target}?q=${encodeURIComponent(query)}` : target;
            window.location.href = url;
        });
    });
}

function setupHeroCarousel() {
    const hero = document.querySelector("[data-hero]");

    if (!hero) {
        return;
    }

    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const thumbs = Array.from(hero.querySelectorAll("[data-hero-thumb]"));
    const previous = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let current = 0;
    let timer = null;

    function activate(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("is-active", dotIndex === current);
        });
        thumbs.forEach((thumb, thumbIndex) => {
            thumb.classList.toggle("is-active", thumbIndex === current);
        });
    }

    function start() {
        stop();
        timer = window.setInterval(() => activate(current + 1), 6500);
    }

    function stop() {
        if (timer) {
            window.clearInterval(timer);
        }
    }

    previous?.addEventListener("click", () => {
        activate(current - 1);
        start();
    });

    next?.addEventListener("click", () => {
        activate(current + 1);
        start();
    });

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            activate(Number(dot.dataset.slide || 0));
            start();
        });
    });

    thumbs.forEach((thumb) => {
        thumb.addEventListener("mouseenter", () => {
            activate(Number(thumb.dataset.slide || 0));
            start();
        });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    activate(0);
    start();
}

function setupFilters() {
    const panels = document.querySelectorAll("[data-filter-panel]");

    panels.forEach((panel) => {
        const root = panel.closest("section") || document;
        const list = root.querySelector("[data-filter-list]");
        const cards = list ? Array.from(list.querySelectorAll("[data-movie-card]")) : [];
        const keywordInput = panel.querySelector("[data-filter-keyword]");
        const typeSelect = panel.querySelector("[data-filter-type]");
        const yearSelect = panel.querySelector("[data-filter-year]");
        const categorySelect = panel.querySelector("[data-filter-category]");
        const countNode = panel.querySelector("[data-filter-count]");
        const resetButtons = root.querySelectorAll("[data-filter-reset]");
        const emptyState = root.querySelector("[data-empty-state]");

        if (!cards.length) {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get("q");
        if (initialQuery && keywordInput) {
            keywordInput.value = initialQuery;
        }

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function apply() {
            const keyword = normalize(keywordInput?.value);
            const type = normalize(typeSelect?.value);
            const year = normalize(yearSelect?.value);
            const category = normalize(categorySelect?.value);
            let visibleCount = 0;

            cards.forEach((card) => {
                const search = normalize(card.dataset.search);
                const cardType = normalize(card.dataset.type);
                const cardYear = normalize(card.dataset.year);
                const cardCategory = normalize(card.dataset.category);

                const matched =
                    (!keyword || search.includes(keyword)) &&
                    (!type || cardType === type) &&
                    (!year || cardYear === year) &&
                    (!category || cardCategory === category);

                card.hidden = !matched;
                if (matched) {
                    visibleCount += 1;
                }
            });

            if (countNode) {
                countNode.textContent = `已显示 ${visibleCount} 部影片 / 共 ${cards.length} 部`;
            }

            if (emptyState) {
                emptyState.hidden = visibleCount !== 0;
            }
        }

        [keywordInput, typeSelect, yearSelect, categorySelect].forEach((control) => {
            control?.addEventListener("input", apply);
            control?.addEventListener("change", apply);
        });

        resetButtons.forEach((button) => {
            button.addEventListener("click", () => {
                if (keywordInput) keywordInput.value = "";
                if (typeSelect) typeSelect.value = "";
                if (yearSelect) yearSelect.value = "";
                if (categorySelect) categorySelect.value = "";
                apply();
            });
        });

        apply();
    });
}

function setupPlayers() {
    document.querySelectorAll("[data-player]").forEach((player, playerIndex) => {
        const video = player.querySelector("video");
        const playButton = player.querySelector("[data-play-button]");
        const playToggle = player.querySelector("[data-play-toggle]");
        const muteToggle = player.querySelector("[data-mute-toggle]");
        const fullscreenToggle = player.querySelector("[data-fullscreen-toggle]");
        const loading = player.querySelector("[data-player-loading]");
        const error = player.querySelector("[data-player-error]");
        const source = player.dataset.src || m3u8Sources[playerIndex % m3u8Sources.length];
        let hls = null;
        let initialized = false;

        if (!video || !source) {
            showError("未找到可用播放源");
            return;
        }

        function showLoading(visible) {
            if (loading) {
                loading.hidden = !visible;
            }
        }

        function showError(message) {
            if (error) {
                error.hidden = false;
                error.textContent = message;
            }
        }

        function initializePlayer() {
            if (initialized) {
                return;
            }

            initialized = true;
            showLoading(true);

            if (Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, () => showLoading(false));
                hls.on(Hls.Events.ERROR, (event, data) => {
                    if (!data.fatal) {
                        return;
                    }

                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        showError("网络错误，正在尝试重新加载播放源");
                        hls.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        showError("媒体加载异常，正在尝试恢复播放");
                        hls.recoverMediaError();
                    } else {
                        showError("当前播放源暂时无法播放");
                        hls.destroy();
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.addEventListener("loadedmetadata", () => showLoading(false), { once: true });
            } else {
                showLoading(false);
                showError("您的浏览器暂不支持 HLS 播放");
            }
        }

        async function playOrPause() {
            initializePlayer();

            if (video.paused) {
                try {
                    await video.play();
                } catch (err) {
                    showError("播放被浏览器拦截，请再次点击播放按钮");
                }
            } else {
                video.pause();
            }
        }

        playButton?.addEventListener("click", playOrPause);
        playToggle?.addEventListener("click", playOrPause);
        video.addEventListener("click", playOrPause);

        muteToggle?.addEventListener("click", () => {
            video.muted = !video.muted;
            muteToggle.textContent = video.muted ? "取消静音" : "静音";
        });

        fullscreenToggle?.addEventListener("click", () => {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                player.requestFullscreen?.();
            }
        });

        video.addEventListener("play", () => player.classList.add("is-playing"));
        video.addEventListener("pause", () => player.classList.remove("is-playing"));
        video.addEventListener("waiting", () => showLoading(true));
        video.addEventListener("playing", () => showLoading(false));
    });
}
