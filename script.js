// Hamburger menu toggle
function toggleMenu() {
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");
  menu.classList.toggle("open");
  icon.classList.toggle("open");
}

// Footer copyright year
(function () {
  const year = new Date().getFullYear();
  const yearElement = document.getElementById("current-year");
  if (yearElement) {
    yearElement.textContent = year;
  }
})();

// Dark mode

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

// Pick theme: saved > OS preference > light
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

// Scroll-to-top button
// Shows up when the contact section or footer is visible (uses IntersectionObserver).

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

// Close the menu if user clicks anywhere outside it
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
