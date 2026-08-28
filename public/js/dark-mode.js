(function () {
    'use strict';

    const storageKey = 'pilkb-dark-mode';
    const clickedKey = 'pilkb-dark-mode-clicked';
    const newBadgeId = 'darkModeNewBadge';
    const transitionClass = 'theme-transitioning';

    function isBadgeSeen() {
        return localStorage.getItem(clickedKey) === 'true' || localStorage.getItem(storageKey) !== null;
    }

    function updateBadgeVisibility() {
        const newBadge = document.getElementById(newBadgeId);
        if (!newBadge) return;

        if (isBadgeSeen()) {
            newBadge.classList.add('d-none');
        } else {
            newBadge.classList.remove('d-none');
        }
    }

    function markBadgeSeen() {
        localStorage.setItem(clickedKey, 'true');
        const newBadge = document.getElementById(newBadgeId);
        if (newBadge) {
            newBadge.classList.add('d-none');
        }
    }

    function setTheme(isDark, persist, animate) {
        const darkStylesheet = document.getElementById('appDarkThemeStylesheet');
        const toggle = document.getElementById('darkModeToggle');
        const iconWrapper = document.getElementById('darkModeIcon') || toggle;

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
            if (iconWrapper) {
                iconWrapper.innerHTML = '<i data-feather="' + (isDark ? 'sun' : 'moon') + '"></i>';
            }
            if (window.feather) {
                window.feather.replace();
            }
        }

        if (persist) {
            localStorage.setItem(storageKey, isDark ? 'dark' : 'light');
            markBadgeSeen();
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

        updateBadgeVisibility();
        setTheme(useDarkMode, false, false);

        const toggle = document.getElementById('darkModeToggle');
        if (toggle) {
            toggle.addEventListener('click', function () {
                markBadgeSeen();
                const isCurrentlyDark = document.body.classList.contains('dark-mode');
                setTheme(!isCurrentlyDark, true, true);
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
