# Portfolio & Technical Blog Website Monorepo

This repository contains the source code for my personal website. It serves as both my professional online presence and a live demonstration of my skills in DevOps, cloud infrastructure, and security engineering — showcasing a modern, hybrid CI/CD pipeline that manages two distinct projects from a single repository.

| Site               | URL                                                    | Hosting Platform |
| :----------------- | :----------------------------------------------------- | :--------------- |
| **Portfolio**      | [**https://naol.dev**](https://naol.dev)               | GitHub Pages     |
| **Technical Blog** | [**https://blog.naol.dev**](https://blog.naol.dev)     | Cloudflare Pages |

---

## About The Project

This repository houses two distinct websites, both deployed from the `main` branch:

*   **Portfolio (`naol.dev`):** A modern, responsive static site built with HTML, CSS, and JavaScript. It covers my professional profile and featured projects. The hero section features an interactive particle background powered by [Three.js `v0.169.0`](https://threejs.org/) with custom GLSL shaders, inspired by the animation on [antigravity.google](https://antigravity.google). Three.js is loaded via an [import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap) from a CDN — no build step required.
*   **Technical Blog (`blog.naol.dev`):** A blog built with the [Hugo](https://gohugo.io/) static site generator and the [Blowfish](https://github.com/nunocoracao/blowfish) theme (included as a Git submodule). I publish hands-on research and articles on digital forensics, GRC, cloud security, and AI.

## Technical Architecture

This project is a practical showcase of a complete development and deployment workflow. The architecture is designed to be efficient, automated, and simple.

*   **Monorepo Structure:** A single Git repository hosts two distinct projects: a static HTML/CSS/JS portfolio at the root and a Hugo-based blog inside the `/blog` subdirectory. All source code lives on the `main` branch.

*   **Hybrid CI/CD Pipeline:** The deployment process is fully automated using the platform best suited for each task:
    *   The portfolio at **`naol.dev`** is deployed via a **GitHub Actions** workflow (`static.yml`) that triggers on pushes to `main`, but is configured with `paths-ignore: blog/**` so it only runs when portfolio files change.
    *   The blog at **`blog.naol.dev`** is automatically built and deployed using **Cloudflare Pages**, which detects pushes to `main` and builds only from the `/blog` subdirectory.

*   **DNS & Routing:** Cloudflare DNS sits in front of the entire setup, routing `naol.dev` to GitHub Pages (via a `CNAME` record) and `blog.naol.dev` to Cloudflare Pages.

## Tech Stack

| Category                 | Technologies                                                    |
| :----------------------- | :-------------------------------------------------------------- |
| **Portfolio (Frontend)** | `HTML5`, `CSS3`, `JavaScript`, `Three.js`, `GLSL`      |
| **Blog (SSG)**           | `Hugo`, `Markdown`, `Blowfish Theme`                            |
| **Platform & DevOps**    | `Git`, `GitHub Actions`, `Cloudflare Pages`, `Cloudflare DNS`   |

---

## Getting Started Locally

You are welcome to clone this repository and use its structure as a template for your own sites.

### Prerequisites

*   [Git](https://git-scm.com/downloads)
*   [Hugo (Extended Version)](https://gohugo.io/installation/) — only required to run the blog locally.
*   Any local HTTP server for the portfolio (options below).

### 1. Clone the Repository

```bash
git clone --recurse-submodules https://github.com/NaolMengistu/portfolio-website.git
cd portfolio-website
```

> **Note:** The `--recurse-submodules` flag is required to also pull the Blowfish theme for the blog. If you only want the portfolio, a regular `git clone` is sufficient.

### 2. Running the Portfolio Locally

The portfolio is a fully static site. Three.js is loaded from a CDN via an import map, so there is **no build step or `npm install` needed**. Just serve the root directory with any local HTTP server:

```bash
# Option A — npx (no global install needed):
npx serve .

# Option B — Python 3:
python -m http.server 8080

# Option C — VS Code Live Server extension (open index.html, click "Go Live")
```

Then open `http://localhost:3000` (or whichever port your server uses) in your browser.

> **Why a server and not just opening `index.html` directly?** Browsers block ES module imports (used by Three.js) when loading files from the local filesystem (`file://` protocol). A local HTTP server is the way to go.

### 3. Running the Blog Locally

```bash
# Navigate to the blog directory:
cd blog

# Start the Hugo development server:
hugo server
```

Then open `http://localhost:1313` to see the blog live with hot-reloading.