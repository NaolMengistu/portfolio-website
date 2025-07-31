/**
 * Toggles the visibility of the mobile navigation menu.
 * It adds/removes the 'open' class to the menu and hamburger icon,
 * which triggers the CSS animations and transitions.
 */
function toggleMenu() {
  // Select the menu container element
  const menu = document.querySelector(".menu-links");
  // Select the hamburger icon element
  const icon = document.querySelector(".hamburger-icon");
  // Toggle the 'open' class on the menu to show/hide it
  menu.classList.toggle("open");
  // Toggle the 'open' class on the icon to animate it into an 'X'
  icon.classList.toggle("open");
}

/**
 * Dynamically updates the copyright year in the footer.
 * This ensures the year is always current without manual updates.
 */
(function() {
  // Get the current year
  const year = new Date().getFullYear();
  // Find the span element with the id 'current-year' and set its text content
  const yearElement = document.getElementById("current-year");
  if (yearElement) {
    yearElement.textContent = year;
  }
})();


// --- DARK MODE THEME TOGGLE SCRIPT ---

// Select all theme toggle buttons (for both desktop and mobile)
const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
// Select the body element to apply the theme class
const body = document.body;

/**
 * Applies the specified theme to the body.
 * @param {string} theme - The theme to apply ('dark' or 'light').
 */
const applyTheme = (theme) => {
  if (theme === 'dark') {
    // Add 'dark-mode' class to the body to activate dark theme styles
    body.classList.add('dark-mode');
  } else {
    // Remove 'dark-mode' class to revert to light theme styles
    body.classList.remove('dark-mode');
  }
};

/**
 * Toggles the theme between light and dark and saves the preference.
 */
const toggleTheme = () => {
  // Determine the new theme based on the current one
  const newTheme = body.classList.contains('dark-mode') ? 'light' : 'dark';
  // Apply the new theme
  applyTheme(newTheme);
  // Save the user's preference to localStorage for persistence across visits
  localStorage.setItem('theme', newTheme);
};

// Attach the 'click' event listener to every theme toggle button found
themeToggleBtns.forEach(btn => {
  btn.addEventListener('click', toggleTheme);
});


/**
 * Automatically detects and applies the theme on initial page load.
 * Priority: 1. Saved theme in localStorage, 2. User's OS preference, 3. Default to light.
 */
(function() {
  // Check for a previously saved theme in localStorage
  const savedTheme = localStorage.getItem('theme');
  // Check if the user's operating system prefers a dark color scheme
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme) {
    // If a theme is saved, apply it
    applyTheme(savedTheme);
  } else if (prefersDark) {
    // If no theme is saved but the OS prefers dark, apply dark theme
    applyTheme('dark');
  } else {
    // Otherwise, default to the light theme
    applyTheme('light');
  }
})();