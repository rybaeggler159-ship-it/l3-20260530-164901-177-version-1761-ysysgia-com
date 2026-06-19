document.addEventListener('DOMContentLoaded', function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      mobilePanel.hidden = expanded;
    });
  }

  var hero = document.querySelector('.hero-section');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('active', itemIndex === current);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('active', itemIndex === current);
      });
    }

    function run() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    function reset() {
      if (timer) {
        window.clearInterval(timer);
      }
      run();
    }

    if (slides.length > 1) {
      if (prev) {
        prev.addEventListener('click', function () {
          showSlide(current - 1);
          reset();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          showSlide(current + 1);
          reset();
        });
      }
      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          showSlide(index);
          reset();
        });
      });
      run();
    }
  }

  var filterInput = document.querySelector('.local-filter-input');
  var filterCards = Array.prototype.slice.call(document.querySelectorAll('.filterable-grid .movie-card'));
  var yearButtons = Array.prototype.slice.call(document.querySelectorAll('[data-year-filter]'));
  var activeYear = 'all';

  function filterLocalCards() {
    var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
    filterCards.forEach(function (card) {
      var text = (card.getAttribute('data-search-text') || '').toLowerCase();
      var year = card.getAttribute('data-year') || '';
      var matchedText = !query || text.indexOf(query) !== -1;
      var matchedYear = activeYear === 'all' || year === activeYear;
      card.classList.toggle('is-hidden-by-filter', !(matchedText && matchedYear));
    });
  }

  if (filterInput && filterCards.length) {
    filterInput.addEventListener('input', filterLocalCards);
  }

  if (yearButtons.length && filterCards.length) {
    yearButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeYear = button.getAttribute('data-year-filter') || 'all';
        yearButtons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        filterLocalCards();
      });
    });
  }

  var searchResults = document.getElementById('search-results');

  if (searchResults && window.SEARCH_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get('q') || '';
    var input = document.getElementById('search-page-input');
    var heading = document.getElementById('search-result-heading');

    if (input) {
      input.value = queryValue;
    }

    function renderCard(movie) {
      var tags = movie.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return '<article class="movie-card">' +
        '<a href="./' + movie.file + '" aria-label="' + escapeHtml(movie.title) + '">' +
        '<div class="movie-thumb">' +
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="thumb-shade"></span>' +
        '<span class="play-badge">▶</span>' +
        '</div>' +
        '<div class="movie-info">' +
        '<h3>' + escapeHtml(movie.title) + '</h3>' +
        '<p>' + escapeHtml(movie.oneLine) + '</p>' +
        '<div class="movie-meta-line"><span>' + movie.year + '年</span><span>' + escapeHtml(movie.region) + '</span></div>' +
        '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
        '</a>' +
        '</article>';
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"]/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[char];
      });
    }

    var keyword = queryValue.trim().toLowerCase();
    var results = window.SEARCH_MOVIES.filter(function (movie) {
      if (!keyword) {
        return movie.pick;
      }
      return movie.searchText.toLowerCase().indexOf(keyword) !== -1;
    }).slice(0, keyword ? 80 : 32);

    if (heading) {
      heading.textContent = keyword ? '搜索结果' : '推荐浏览';
    }

    searchResults.innerHTML = results.map(renderCard).join('');
  }
});
