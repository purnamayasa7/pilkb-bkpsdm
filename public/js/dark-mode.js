(function () {
    'use strict';

    const storageKey = 'pilkb-dark-mode';
    const transitionClass = 'theme-transitioning';

    function setTheme(isDark, persist, animate) {
        const darkStylesheet = document.getElementById('appDarkThemeStylesheet');
        const toggle = document.getElementById('darkModeToggle');

        if (animate) {
            document.documentElement.classList.add(transitionClass);
        }

        if (darkStylesheet) {
            darkStylesheet.media = isDark ? 'all' : 'not all';
        }

        document.body.classList.toggle('dark-mode', isDark);
        document.documentElement.classList.toggle('dark-mode', isDark);

        if (toggle) {
            toggle.setAttribute('aria-label', isDark ? 'Aktifkan light mode' : 'Aktifkan dark mode');
            toggle.setAttribute('title', isDark ? 'Aktifkan light mode' : 'Aktifkan dark mode');
            toggle.innerHTML = '<i data-feather="' + (isDark ? 'sun' : 'moon') + '"></i>';
            if (window.feather) {
                window.feather.replace();
            }
        }

        if (persist) {
            localStorage.setItem(storageKey, isDark ? 'dark' : 'light');
        }

        if (animate) {
            window.setTimeout(function () {
                document.documentElement.classList.remove(transitionClass);
            }, 220);
        }
    }

    function initialize() {
        const savedTheme = localStorage.getItem(storageKey);
        const useDarkMode = savedTheme === 'dark';

        setTheme(useDarkMode, false, false);

        const toggle = document.getElementById('darkModeToggle');
        if (toggle) {
            toggle.addEventListener('click', function () {
                setTheme(!document.body.classList.contains('dark-mode'), true, true);
            });
        }

        window.requestAnimationFrame(function () {
            document.documentElement.classList.remove('page-loading');
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();
