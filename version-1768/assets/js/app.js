(function () {
  var root = document.body.getAttribute("data-root") || "./";

  function goSearch(query) {
    var value = (query || "").trim();
    var url = root + "search.html";
    if (value) {
      url += "?q=" + encodeURIComponent(value);
    }
    window.location.href = url;
  }

  document.querySelectorAll("[data-header-search]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input[name='q']");
      goSearch(input ? input.value : "");
    });
  });

  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");
  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("img[data-img]").forEach(function (image) {
    image.addEventListener("error", function () {
      image.classList.add("is-img-hidden");
    }, { once: true });
  });

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        startTimer();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        startTimer();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        startTimer();
      });
    });
    showSlide(0);
    startTimer();
  }

  var localFilter = document.querySelector("[data-local-filter]");
  if (localFilter) {
    localFilter.addEventListener("input", function () {
      var keyword = localFilter.value.trim().toLowerCase();
      document.querySelectorAll("[data-card]").forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-type")
        ].join(" ").toLowerCase();
        card.style.display = text.indexOf(keyword) >= 0 ? "" : "none";
      });
    });
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  var searchPage = document.querySelector("[data-search-page]");
  if (searchPage && window.MOVIE_INDEX) {
    var form = searchPage.querySelector("[data-search-form]");
    var input = searchPage.querySelector("[data-search-input]");
    var typeSelect = searchPage.querySelector("[data-search-type]");
    var yearSelect = searchPage.querySelector("[data-search-year]");
    var resultBox = searchPage.querySelector("[data-search-results]");
    var countBox = searchPage.querySelector("[data-search-count]");
    var params = new URLSearchParams(window.location.search);
    input.value = params.get("q") || "";

    var years = Array.prototype.slice.call(new Set(window.MOVIE_INDEX.map(function (movie) {
      return movie.year;
    }))).filter(Boolean).sort().reverse().slice(0, 18);

    years.forEach(function (year) {
      var option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    });

    function movieCard(movie) {
      var tagHtml = (movie.tags || []).slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");
      return "" +
        "<article class=\"movie-card\" data-card>" +
        "<a class=\"movie-card-link\" href=\"" + escapeHtml(movie.href) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
        "<span class=\"poster-wrap\"><img src=\"" + escapeHtml(movie.poster) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" data-img><span class=\"play-mark\" aria-hidden=\"true\">▶</span></span>" +
        "<span class=\"movie-card-body\">" +
        "<strong>" + escapeHtml(movie.title) + "</strong>" +
        "<em>" + escapeHtml(movie.one_line) + "</em>" +
        "<span class=\"movie-meta-line\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></span>" +
        "<span class=\"tag-list\">" + tagHtml + "</span>" +
        "</span></a></article>";
    }

    function render() {
      var keyword = input.value.trim().toLowerCase();
      var typeValue = typeSelect.value;
      var yearValue = yearSelect.value;
      var results = window.MOVIE_INDEX.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.one_line, (movie.tags || []).join(" ")].join(" ").toLowerCase();
        var matchedKeyword = !keyword || text.indexOf(keyword) >= 0;
        var matchedType = !typeValue || movie.type === typeValue;
        var matchedYear = !yearValue || movie.year === yearValue;
        return matchedKeyword && matchedType && matchedYear;
      }).slice(0, 160);

      countBox.textContent = results.length ? "为你找到相关影片" : "暂无匹配影片";
      resultBox.innerHTML = results.length ? results.map(movieCard).join("") : "<div class=\"empty-state\">换个关键词再试试</div>";
      resultBox.querySelectorAll("img[data-img]").forEach(function (image) {
        image.addEventListener("error", function () {
          image.classList.add("is-img-hidden");
        }, { once: true });
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      render();
    });
    [input, typeSelect, yearSelect].forEach(function (element) {
      element.addEventListener("input", render);
      element.addEventListener("change", render);
    });
    render();
  }

  document.querySelectorAll("[data-player]").forEach(function (player) {
    var video = player.querySelector("video");
    var cover = player.querySelector("[data-player-cover]");
    var trigger = player.querySelector("[data-player-trigger]");
    var status = player.querySelector("[data-player-status]");
    var stream = player.getAttribute("data-stream");
    var started = false;

    function setStatus(text) {
      if (status) {
        status.textContent = text || "";
      }
    }

    function runVideoPlay() {
      var playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {
          setStatus("点击视频继续播放");
        });
      }
    }

    function startPlayer() {
      if (!video || !stream) return;
      if (started) {
        runVideoPlay();
        return;
      }
      started = true;
      video.controls = true;
      if (cover) {
        cover.classList.add("is-hidden");
      }
      setStatus("正在加载影片...");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        video.addEventListener("loadedmetadata", function () {
          setStatus("");
          runVideoPlay();
        }, { once: true });
        runVideoPlay();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        player._hls = hls;
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus("");
          runVideoPlay();
        });
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            setStatus("播放源加载失败，请稍后重试");
          }
        });
        return;
      }

      video.src = stream;
      video.addEventListener("loadedmetadata", function () {
        setStatus("");
        runVideoPlay();
      }, { once: true });
      runVideoPlay();
    }

    if (trigger) {
      trigger.addEventListener("click", startPlayer);
    }
    if (cover) {
      cover.addEventListener("click", startPlayer);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (!started) {
          startPlayer();
        }
      });
    }
  });
})();
