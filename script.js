/**
 * Naol Mengistu - Unified Portfolio Script
 * Handles theme toggling, mobile menu, scroll-to-top, and reveal-on-scroll animations.
 */

// 1. Mobile Menu Logic
function toggleMenu() {
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");
  if (menu && icon) {
    menu.classList.toggle("open");
    icon.classList.toggle("open");
  }
}

// Close mobile menu when clicking outside
document.addEventListener("click", (event) => {
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");
  if (menu && menu.classList.contains("open")) {
    if (!menu.contains(event.target) && !icon.contains(event.target)) {
      toggleMenu();
    }
  }
});

// 2. Theme Management
const applyTheme = (theme) => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark-mode');
  } else {
    document.documentElement.classList.remove('dark-mode');
  }
};

const toggleTheme = () => {
  const newTheme = document.documentElement.classList.contains('dark-mode') ? 'light' : 'dark';
  applyTheme(newTheme);
  localStorage.setItem('theme', newTheme);
};

// Initialize Theme (redundancy check if head script was blocked)
(function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (savedTheme) {
    applyTheme(savedTheme);
  } else if (prefersDark) {
    applyTheme('dark');
  }
})();

// 3. Scroll-to-Top Logic
const initScrollToTop = () => {
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");
  if (!scrollToTopBtn) return;

  const observer = new IntersectionObserver((entries) => {
    const isVisible = entries.some(entry => entry.isIntersecting);
    scrollToTopBtn.classList.toggle("show", isVisible);
  }, { threshold: 0.01 });

  const contactSection = document.getElementById("contact");
  const footer = document.querySelector("footer");
  if (contactSection) observer.observe(contactSection);
  if (footer) observer.observe(footer);

  scrollToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
};

// 4. Reveal-on-Scroll Logic
const initRevealOnScroll = () => {
  const revealElements = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Once revealed, we can stop observing this specific element
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  revealElements.forEach(el => observer.observe(el));
};

// 5. Global Utilities (Copyright Year, Card Height Equalizer)
const initUtilities = () => {
  const yearElement = document.getElementById("current-year");
  if (yearElement) yearElement.textContent = new Date().getFullYear();

  const equalizeHeights = () => {
    const cards = document.querySelectorAll('.project-card, .product-card');
    if (!cards.length) return;
    cards.forEach(card => card.style.height = 'auto');
    let maxHeight = 0;
    cards.forEach(card => {
      if (card.offsetHeight > maxHeight) maxHeight = card.offsetHeight;
    });
    cards.forEach(card => card.style.height = maxHeight + 'px');
  };

  window.addEventListener('load', equalizeHeights);
  let lastWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth !== lastWidth) {
      equalizeHeights();
      lastWidth = window.innerWidth;
    }
  });
};

// Main Initialization Hook
document.addEventListener('DOMContentLoaded', () => {
  // Theme toggle buttons (can exist in multiple places)
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });

  initScrollToTop();
  initRevealOnScroll();
  initUtilities();
});
