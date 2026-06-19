
(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initHeader() {
    var header = document.querySelector('[data-header]');
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-main-nav]');

    function updateHeader() {
      if (!header) {
        return;
      }
      header.classList.toggle('is-scrolled', window.scrollY > 20);
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        nav.classList.toggle('is-open');
      });
    }
  }

  function initHeroSlider() {
    var sliders = document.querySelectorAll('[data-hero-slider]');

    sliders.forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
      var index = 0;

      if (!slides.length) {
        return;
      }

      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === index);
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          show(dotIndex);
        });
      });

      show(0);
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    });
  }

  function readQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function initHeroSearch() {
    var form = document.querySelector('[data-hero-search]');
    if (!form) {
      return;
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input');
      var query = input ? input.value.trim() : '';
      var target = form.getAttribute('action') || 'movies.html';
      window.location.href = query ? target + '?q=' + encodeURIComponent(query) : target;
    });
  }

  function initFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var container = document.querySelector('[data-listing-grid]') || document.querySelector('.ranking-list');

    if (!panel || !cards.length) {
      return;
    }

    var searchInput = panel.querySelector('[data-search-input]');
    var categorySelect = panel.querySelector('[data-filter-category]');
    var regionSelect = panel.querySelector('[data-filter-region]');
    var sortSelect = panel.querySelector('[data-sort-select]');
    var result = panel.querySelector('[data-filter-result]');
    var noResults = document.querySelector('[data-no-results]');
    var initialQuery = readQuery();

    if (initialQuery && searchInput) {
      searchInput.value = initialQuery;
    }

    function getText(card) {
      return (card.getAttribute('data-search') || '').toLowerCase();
    }

    function applySort(visibleCards) {
      if (!container || !sortSelect) {
        return;
      }

      var sortValue = sortSelect.value;
      if (sortValue === 'default') {
        cards.forEach(function (card) {
          container.appendChild(card);
        });
        return;
      }

      visibleCards.sort(function (a, b) {
        if (sortValue === 'title') {
          return getText(a).localeCompare(getText(b), 'zh-Hans-CN');
        }
        if (sortValue === 'year') {
          var aYear = parseInt((getText(a).match(/(19|20)\d{2}/) || ['0'])[0], 10);
          var bYear = parseInt((getText(b).match(/(19|20)\d{2}/) || ['0'])[0], 10);
          return bYear - aYear;
        }
        return 0;
      });

      visibleCards.forEach(function (card) {
        container.appendChild(card);
      });
    }

    function applyFilters() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var category = categorySelect ? categorySelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var visible = [];

      cards.forEach(function (card) {
        var matchesQuery = !query || getText(card).indexOf(query) !== -1;
        var matchesCategory = !category || card.getAttribute('data-category') === category;
        var matchesRegion = !region || card.getAttribute('data-region') === region;
        var show = matchesQuery && matchesCategory && matchesRegion;

        card.classList.toggle('is-hidden', !show);
        if (show) {
          visible.push(card);
        }
      });

      applySort(visible);

      if (result) {
        result.textContent = '当前显示 ' + visible.length + ' 部影片，共 ' + cards.length + ' 部影片。';
      }

      if (noResults) {
        noResults.classList.toggle('is-visible', visible.length === 0);
      }
    }

    [searchInput, categorySelect, regionSelect, sortSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  function initImages() {
    document.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
        var parent = image.closest('.poster-wrap, .hero-slide, .cover-large, .related-item, .ranking-row');
        if (parent) {
          parent.classList.add('image-missing');
        }
      });
    });
  }

  function initVideoPlayers() {
    var players = document.querySelectorAll('[data-player]');

    players.forEach(function (player) {
      var video = player.querySelector('video[data-src]');
      var button = player.querySelector('[data-play-button]');

      if (!video) {
        return;
      }

      var source = video.getAttribute('data-src');
      var hlsInstance = null;

      function attachSource() {
        if (!source || video.getAttribute('data-source-attached') === 'true') {
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              hlsInstance.destroy();
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }

        video.setAttribute('data-source-attached', 'true');
      }

      attachSource();

      if (button) {
        button.addEventListener('click', function () {
          attachSource();
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
              video.controls = true;
            });
          }
        });
      }

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        player.classList.remove('is-playing');
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initHeader();
    initHeroSlider();
    initHeroSearch();
    initFilters();
    initImages();
    initVideoPlayers();
  });
})();
