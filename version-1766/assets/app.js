(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === current);
        });
    }

    function startHero() {
        if (timer || slides.length < 2) {
            return;
        }
        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    function resetHero() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
        startHero();
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
            resetHero();
        });
    });

    if (prev) {
        prev.addEventListener("click", function () {
            showSlide(current - 1);
            resetHero();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            showSlide(current + 1);
            resetHero();
        });
    }

    startHero();

    var searchInput = document.querySelector("[data-local-search]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card-list] article"));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
    var activeYear = "";
    var activeType = "";

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
        var query = normalize(searchInput ? searchInput.value : "");
        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute("data-search") || card.textContent);
            var year = card.getAttribute("data-year") || "";
            var type = card.getAttribute("data-type") || "";
            var matchedQuery = !query || haystack.indexOf(query) !== -1;
            var matchedYear = !activeYear || year === activeYear;
            var matchedType = !activeType || type === activeType;
            card.classList.toggle("is-hidden-by-filter", !(matchedQuery && matchedYear && matchedType));
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
    }

    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            filterButtons.forEach(function (item) {
                item.classList.remove("is-active");
            });
            button.classList.add("is-active");
            if (button.hasAttribute("data-filter-all")) {
                activeYear = "";
                activeType = "";
            } else if (button.hasAttribute("data-filter-year")) {
                activeYear = button.getAttribute("data-filter-year") || "";
                activeType = "";
            } else if (button.hasAttribute("data-filter-type")) {
                activeType = button.getAttribute("data-filter-type") || "";
                activeYear = "";
            }
            applyFilters();
        });
    });
})();
