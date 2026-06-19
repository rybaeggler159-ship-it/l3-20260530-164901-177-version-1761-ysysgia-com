(function () {
    var input = document.getElementById("search-input");
    var results = document.getElementById("search-results");
    var title = document.getElementById("search-title");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    var movies = window.SITE_MOVIES || [];

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function createTags(tags) {
        return (tags || []).slice(0, 4).map(function (tag) {
            return '<span class="tag">' + escapeHtml(tag) + '</span>';
        }).join("");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function card(movie) {
        return '<article class="movie-card">' +
            '<a class="poster-link" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">' +
            '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '<span class="poster-shade"></span>' +
            '<span class="year-badge">' + escapeHtml(movie.year) + '</span>' +
            '</a>' +
            '<div class="card-body">' +
            '<div class="card-meta">' +
            '<a href="' + movie.categoryUrl + '">' + escapeHtml(movie.category) + '</a>' +
            '<span>' + escapeHtml(movie.region) + '</span>' +
            '<span>' + escapeHtml(movie.type) + '</span>' +
            '</div>' +
            '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>' +
            '<p>' + escapeHtml(movie.oneLine) + '</p>' +
            '<div class="tag-row">' + createTags(movie.tags) + '</div>' +
            '</div>' +
            '</article>';
    }

    function render(query) {
        var q = normalize(query);
        var list = q ? movies.filter(function (movie) {
            return normalize(movie.text).indexOf(q) !== -1;
        }) : movies.slice(0, 48);
        list = list.slice(0, 120);
        if (title) {
            title.textContent = q ? '与“' + query + '”相关的内容' : '精选内容';
        }
        if (results) {
            results.innerHTML = list.map(card).join("");
        }
    }

    if (input) {
        input.value = initialQuery;
        input.addEventListener("input", function () {
            render(input.value);
        });
    }

    render(initialQuery);
})();
