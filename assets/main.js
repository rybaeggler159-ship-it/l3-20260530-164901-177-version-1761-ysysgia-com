(function() {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function() {
        var toggle = document.querySelector('.nav-toggle');
        var mobileNav = document.querySelector('.mobile-nav');
        if (toggle && mobileNav) {
            toggle.addEventListener('click', function() {
                mobileNav.classList.toggle('is-open');
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        var current = 0;
        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }
        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                showSlide(Number(dot.getAttribute('data-slide') || 0));
            });
        });
        if (slides.length > 1) {
            window.setInterval(function() {
                showSlide(current + 1);
            }, 5600);
        }

        var forms = Array.prototype.slice.call(document.querySelectorAll('[data-search-form]'));
        forms.forEach(function(form) {
            form.addEventListener('submit', function(event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var q = input ? input.value.trim() : '';
                var target = './search.html';
                if (q) {
                    target += '?q=' + encodeURIComponent(q);
                }
                window.location.href = target;
            });
        });

        var filterBoxes = Array.prototype.slice.call(document.querySelectorAll('.filter-box'));
        filterBoxes.forEach(function(box) {
            var scope = box.parentElement || document;
            var input = box.querySelector('.filter-input');
            var selects = Array.prototype.slice.call(box.querySelectorAll('.filter-select'));
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.filter-list .movie-card'));
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q') || '';
            if (input && q) {
                input.value = q;
            }

            function apply() {
                var text = input ? input.value.trim().toLowerCase() : '';
                var selected = {};
                selects.forEach(function(select) {
                    selected[select.getAttribute('data-filter')] = select.value;
                });
                cards.forEach(function(card) {
                    var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                    var year = card.getAttribute('data-year') || '';
                    var type = card.getAttribute('data-type') || '';
                    var matchText = !text || haystack.indexOf(text) !== -1;
                    var matchYear = !selected.year || year === selected.year;
                    var matchType = !selected.type || type === selected.type;
                    card.classList.toggle('is-filtered-out', !(matchText && matchYear && matchType));
                });
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            selects.forEach(function(select) {
                select.addEventListener('change', apply);
            });
            apply();
        });
    });
}());
