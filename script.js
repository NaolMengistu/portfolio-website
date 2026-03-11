// Toggles the mobile hamburger menu open and closed
function toggleMenu() {
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");
  menu.classList.toggle("open");
  icon.classList.toggle("open");
}

// Automatically update the footer copyright year so we never have to hardcode it
(function () {
  const year = new Date().getFullYear();
  const yearElement = document.getElementById("current-year");
  if (yearElement) {
    yearElement.textContent = year;
  }
})();

// Theme Manager: Handles saving and toggling Dark/Light mode

const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
const body = document.body;

const applyTheme = (theme) => {
  if (theme === 'dark') {
    body.classList.add('dark-mode');
  } else {
    body.classList.remove('dark-mode');
  }
};

const toggleTheme = () => {
  const newTheme = body.classList.contains('dark-mode') ? 'light' : 'dark';
  applyTheme(newTheme);
  localStorage.setItem('theme', newTheme);
};

themeToggleBtns.forEach(btn => {
  btn.addEventListener('click', toggleTheme);
});

// On initial load: Check localStorage first, then OS preferences, else default to Light
(function () {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme) {
    applyTheme(savedTheme);
  } else if (prefersDark) {
    applyTheme('dark');
  } else {
    applyTheme('light');
  }
})();

// Scroll-to-Top Button Logic
// We use an IntersectionObserver so it only pops up when the user reaches the Contact or Footer sections.

const scrollToTopBtn = document.getElementById("scrollToTopBtn");

if (scrollToTopBtn) {
  const observerCallback = (entries) => {
    const isVisible = entries.some(entry => entry.isIntersecting);
    if (isVisible) {
      scrollToTopBtn.classList.add("show");
    } else {
      scrollToTopBtn.classList.remove("show");
    }
  };

  const observer = new IntersectionObserver(observerCallback, {
    root: null,
    rootMargin: "0px",
    threshold: 0.1
  });

  const contactSection = document.getElementById("contact");
  const footer = document.querySelector("footer");

  if (contactSection) observer.observe(contactSection);
  if (footer) observer.observe(footer);

  scrollToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Close the mobile menu if the user clicks anywhere outside of it
document.addEventListener("click", function (event) {
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");

  if (menu.classList.contains("open")) {
    const isClickInsideMenu = menu.contains(event.target);
    const isClickOnIcon = icon.contains(event.target);

    if (!isClickInsideMenu && !isClickOnIcon) {
      toggleMenu();
    }
  }
});

// Project Card Height Equalizer
// Since we use Flexbox wrapping, this forces all project cards globally to match the height of the tallest card.
function equalizeProjectCardHeights() {
  const cards = document.querySelectorAll('.project-card');
  if (!cards.length) return;

  // Temporarily reset to auto so we can measure their natural flowing height
  cards.forEach(card => card.style.height = 'auto');

  // Scan through all cards to find the absolute tallest one
  let maxHeight = 0;
  cards.forEach(card => {
    if (card.offsetHeight > maxHeight) {
      maxHeight = card.offsetHeight;
    }
  });

  // Enforce that maximum height across the board
  cards.forEach(card => {
    card.style.height = maxHeight + 'px';
  });
}

window.addEventListener('load', equalizeProjectCardHeights);
window.addEventListener('resize', equalizeProjectCardHeights);
