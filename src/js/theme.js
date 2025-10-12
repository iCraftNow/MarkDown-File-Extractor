/**
 * Toggles the color theme of the website between 'light' and 'dark'.
 * It updates the `data-theme` attribute on the body, saves the preference
 * to localStorage, and updates the theme toggle button's icon.
 * @param {HTMLElement} themeToggle - The button element that triggers the theme change.
 */
function toggleTheme(themeToggle) {
    if (!themeToggle) return;
    const newTheme = document.body.dataset.theme === 'light' ? 'dark' : 'light';
    document.body.dataset.theme = newTheme;
    localStorage.setItem('theme', newTheme);
    themeToggle.querySelector('.material-icons-round').textContent = newTheme === 'light' ? 'dark_mode' : 'light_mode';
}

/**
 * Loads the saved theme from localStorage and applies it to the website.
 * If no theme is saved, it defaults to 'light'. It also sets the initial
 * state of the theme toggle button's icon.
 * @param {HTMLElement} themeToggle - The button element that triggers the theme change.
 */
function loadTheme(themeToggle) {
    if (!themeToggle) return;
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.dataset.theme = savedTheme;
    themeToggle.querySelector('.material-icons-round').textContent = savedTheme === 'light' ? 'dark_mode' : 'light_mode';
}

/**
 * Initializes the theme functionality for the website.
 * It finds the theme toggle button, loads the initial theme, and attaches
 * the event listener for toggling the theme.
 */
export function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        loadTheme(themeToggle);
        themeToggle.addEventListener('click', () => toggleTheme(themeToggle));
    }
}