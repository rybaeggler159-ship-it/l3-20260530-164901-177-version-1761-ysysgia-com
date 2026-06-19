const SitePlayer = {
  bind(videoId, coverId, buttonId, streamUrl) {
    const ready = () => {
      const video = document.getElementById(videoId);
      const cover = document.getElementById(coverId);
      const button = document.getElementById(buttonId);
      if (!video || !cover || !button || !streamUrl) {
        return;
      }
      let prepared = false;
      let hlsInstance = null;
      const attach = () => {
        if (prepared) {
          return;
        }
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          return;
        }
        video.src = streamUrl;
      };
      const start = () => {
        attach();
        cover.classList.add("is-hidden");
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {
            cover.classList.remove("is-hidden");
          });
        }
      };
      cover.addEventListener("click", start);
      button.addEventListener("click", start);
      video.addEventListener("play", () => cover.classList.add("is-hidden"));
      video.addEventListener("pause", () => {
        if (!video.currentTime) {
          cover.classList.remove("is-hidden");
        }
      });
      window.addEventListener("pagehide", () => {
        if (hlsInstance && typeof hlsInstance.destroy === "function") {
          hlsInstance.destroy();
        }
      });
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", ready);
    } else {
      ready();
    }
  }
};

(function () {
  const onReady = (fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  };

  const normalize = (value) => String(value || "").toLowerCase().trim();

  onReady(() => {
    const toggle = document.querySelector("[data-menu-toggle]");
    const panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", () => panel.classList.toggle("open"));
    }

    document.querySelectorAll("[data-search-form]").forEach((form) => {
      form.addEventListener("submit", (event) => {
        const input = form.querySelector("input[name='q']");
        const query = input ? input.value.trim() : "";
        if (!query) {
          event.preventDefault();
          return;
        }
      });
    });

    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dot"));
    const prev = document.querySelector("[data-hero-prev]");
    const next = document.querySelector("[data-hero-next]");
    let current = 0;
    const setSlide = (index) => {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle("active", i === current));
      dots.forEach((dot, i) => dot.classList.toggle("active", i === current));
    };
    if (slides.length) {
      prev && prev.addEventListener("click", () => setSlide(current - 1));
      next && next.addEventListener("click", () => setSlide(current + 1));
      dots.forEach((dot, index) => dot.addEventListener("click", () => setSlide(index)));
      window.setInterval(() => setSlide(current + 1), 6000);
    }

    document.querySelectorAll("[data-local-filter]").forEach((form) => {
      const input = form.querySelector("[data-local-input]");
      const clear = form.querySelector("[data-local-clear]");
      const list = document.querySelector("[data-local-list]");
      const empty = document.querySelector("[data-local-empty]");
      if (!input || !list) {
        return;
      }
      const cards = Array.from(list.querySelectorAll(".movie-card"));
      const apply = () => {
        const query = normalize(input.value);
        let visible = 0;
        cards.forEach((card) => {
          const haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region")
          ].join(" "));
          const matched = !query || haystack.includes(query);
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      };
      input.addEventListener("input", apply);
      clear && clear.addEventListener("click", () => {
        input.value = "";
        apply();
        input.focus();
      });
    });

    const searchInput = document.querySelector("[data-search-page-input]");
    const searchResults = document.getElementById("search-results");
    const searchEmpty = document.getElementById("search-empty");
    if (searchInput && searchResults && Array.isArray(window.SEARCH_INDEX)) {
      const params = new URLSearchParams(window.location.search);
      const initial = params.get("q") || "";
      searchInput.value = initial;
      const render = () => {
        const query = normalize(searchInput.value);
        searchResults.innerHTML = "";
        if (!query) {
          searchEmpty.textContent = "请输入关键词开始搜索";
          searchEmpty.classList.add("show");
          return;
        }
        const terms = query.split(/\s+/).filter(Boolean);
        const result = window.SEARCH_INDEX.filter((item) => {
          const haystack = normalize([item.title, item.region, item.year, item.type, item.genre, item.tags, item.one].join(" "));
          return terms.every((term) => haystack.includes(term));
        }).slice(0, 120);
        result.forEach((item) => {
          const article = document.createElement("article");
          article.className = "movie-card compact";
          article.innerHTML = [
            `<a class="poster-link" href="./${item.file}" aria-label="${item.title}">`,
            `<img src="${item.cover}" alt="${item.title}" loading="lazy">`,
            `<span class="play-badge">播放</span>`,
            `</a>`,
            `<div class="card-body">`,
            `<div class="card-meta"><span>${item.year}</span><span>${item.region}</span><span>${item.type}</span></div>`,
            `<h3><a href="./${item.file}">${item.title}</a></h3>`,
            `<p>${item.one}</p>`,
            `</div>`
          ].join("");
          searchResults.appendChild(article);
        });
        searchEmpty.textContent = "没有找到匹配内容";
        searchEmpty.classList.toggle("show", result.length === 0);
      };
      render();
      searchInput.addEventListener("input", render);
    }
  });
}());
