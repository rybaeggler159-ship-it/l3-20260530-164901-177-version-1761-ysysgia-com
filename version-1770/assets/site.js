(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    window.handlePosterError = function (image) {
        image.style.display = "none";
        if (image.parentElement) {
            image.parentElement.classList.add("is-missing");
        }
    };

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector(".main-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function setupFilters() {
        var lists = Array.prototype.slice.call(document.querySelectorAll("[data-card-list]"));
        if (!lists.length) {
            return;
        }

        lists.forEach(function (list) {
            var scope = list.closest("section") || document;
            var input = scope.querySelector("[data-search-box]");
            var chips = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-value]"));
            var empty = scope.querySelector("[data-empty-state]");
            var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
            var activeFilter = "";

            function normalize(value) {
                return String(value || "").trim().toLowerCase();
            }

            function searchable(card) {
                return normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-tags"),
                    card.textContent
                ].join(" "));
            }

            function apply() {
                var query = normalize(input ? input.value : "");
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = searchable(card);
                    var matchesQuery = !query || haystack.indexOf(query) !== -1;
                    var matchesFilter = !activeFilter || haystack.indexOf(normalize(activeFilter)) !== -1;
                    var isVisible = matchesQuery && matchesFilter;
                    card.hidden = !isVisible;
                    if (isVisible) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            if (input) {
                var params = new URLSearchParams(window.location.search);
                if (params.get("q")) {
                    input.value = params.get("q");
                }
                input.addEventListener("input", apply);
            }

            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    activeFilter = chip.getAttribute("data-filter-value") || "";
                    chips.forEach(function (otherChip) {
                        otherChip.classList.toggle("is-active", otherChip === chip);
                    });
                    apply();
                });
            });

            apply();
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-play-button]");
            var source = player.getAttribute("data-src");
            var started = false;

            function loadAndPlay() {
                if (!video || !source) {
                    return;
                }
                if (!started) {
                    if (window.Hls && window.Hls.isSupported()) {
                        var hls = new window.Hls({
                            maxBufferLength: 30,
                            enableWorker: true
                        });
                        hls.loadSource(source);
                        hls.attachMedia(video);
                    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = source;
                    } else {
                        video.src = source;
                    }
                    started = true;
                }
                if (button) {
                    button.classList.add("is-hidden");
                }
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        video.controls = true;
                    });
                }
            }

            if (button) {
                button.addEventListener("click", loadAndPlay);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (!started) {
                        loadAndPlay();
                    }
                });
                video.addEventListener("play", function () {
                    if (button) {
                        button.classList.add("is-hidden");
                    }
                });
            }
        });
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
