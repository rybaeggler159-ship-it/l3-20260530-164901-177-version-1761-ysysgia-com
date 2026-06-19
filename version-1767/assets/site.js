document.addEventListener("DOMContentLoaded", function () {
  initMobileMenu();
  initHero();
  initFilters();
  initMoviePlayer();
});

function initMobileMenu() {
  var toggle = document.querySelector("[data-menu-toggle]");
  var panel = document.querySelector("[data-mobile-panel]");
  if (!toggle || !panel) {
    return;
  }
  toggle.addEventListener("click", function () {
    panel.classList.toggle("is-open");
  });
}

function initHero() {
  var root = document.querySelector("[data-hero]");
  if (!root) {
    return;
  }
  var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
  var prev = root.querySelector("[data-hero-prev]");
  var next = root.querySelector("[data-hero-next]");
  var current = 0;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, position) {
      slide.classList.toggle("is-active", position === current);
    });
    dots.forEach(function (dot, position) {
      dot.classList.toggle("is-active", position === current);
    });
  }

  dots.forEach(function (dot, position) {
    dot.addEventListener("click", function () {
      show(position);
    });
  });

  if (prev) {
    prev.addEventListener("click", function () {
      show(current - 1);
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      show(current + 1);
    });
  }

  if (slides.length > 1) {
    window.setInterval(function () {
      show(current + 1);
    }, 5000);
  }
}

function initFilters() {
  var roots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));
  roots.forEach(function (root) {
    var input = root.querySelector("[data-filter-input]");
    var year = root.querySelector("[data-filter-year]");
    var type = root.querySelector("[data-filter-type]");
    var category = root.querySelector("[data-filter-category]");
    var list = document.querySelector("[data-filter-list]");
    var empty = document.querySelector("[data-empty-state]");
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));

    if (root.hasAttribute("data-url-query") && input) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query) {
        input.value = query;
      }
    }

    function apply() {
      var queryText = input ? input.value.trim().toLowerCase() : "";
      var yearValue = year ? year.value : "";
      var typeValue = type ? type.value : "";
      var categoryValue = category ? category.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var content = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        var matchesQuery = !queryText || content.indexOf(queryText) !== -1;
        var matchesYear = !yearValue || card.getAttribute("data-year") === yearValue;
        var matchesType = !typeValue || card.getAttribute("data-type") === typeValue;
        var matchesCategory = !categoryValue || card.getAttribute("data-category") === categoryValue;
        var shouldShow = matchesQuery && matchesYear && matchesType && matchesCategory;
        card.classList.toggle("is-hidden", !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, year, type, category].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  });
}

function initMoviePlayer() {
  var video = document.getElementById("movie-player");
  if (!video) {
    return;
  }
  var source = video.getAttribute("data-video-src");
  var overlay = document.querySelector("[data-play-overlay]");
  var hlsInstance = null;

  function attach() {
    if (!source || video.getAttribute("data-ready") === "true") {
      return;
    }
    video.setAttribute("data-ready", "true");
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function start() {
    attach();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  }

  attach();

  if (overlay) {
    overlay.addEventListener("click", start);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });

  video.addEventListener("pause", function () {
    if (overlay && video.currentTime === 0) {
      overlay.classList.remove("is-hidden");
    }
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
