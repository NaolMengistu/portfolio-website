# Portfolio & Technical Blog Website Monorepo

This repository contains the source code for my website. It serves as both my professional online presence and a live demonstration of my skills in DevOps, cloud infrastructure, and security engineering. It showcases a modern, hybrid CI/CD pipeline managing two distinct projects from a single source.

| Site                 | URL                                        | Hosting Platform    |
| :------------------- | :----------------------------------------- | :------------------ |
| **Portfolio** | [**https://naol.dev**](https://naol.dev)         | GitHub Pages        |
| **Technical Blog**     | [**https://blog.naol.dev**](https://blog.naol.dev) | Cloudflare Pages    |

---

## About The Project

This repository houses two distinct websites, both deployed from the `main` branch:

*   **Portfolio (`naol.dev`):** A modern, responsive static site built with HTML, CSS, and JavaScript. It details my professional profile, and highlights my major projects.
*   **Technical Blog (`blog.naol.dev`):** A blog site built with the Hugo static site generator and the Blowfish theme. This is where I publish hands-on research, technical tutorials, and articles on topics ranging from digital forensics and GRC to cloud security and AI.

## Technical Architecture Showcase

This project is a practical showcase of a complete development and deployment workflow. The architecture was designed to be efficient, automated, and simple.

*   **Monorepo Structure:** A single Git repository hosts two distinct projects: a static HTML/CSS/JS portfolio and a Hugo-based blog. All source code lives on the `main` branch.

*   **Hybrid CI/CD Pipeline:** The deployment process is fully automated but uses different platforms best suited for each task:
    *   The portfolio at **`naol.dev`** is deployed via a **GitHub Actions** workflow that triggers only when portfolio-specific files are changed.
    *   The Hugo blog at **`blog.naol.dev`** is automatically built and deployed using **Cloudflare Pages**, which intelligently detects pushes to the `main` branch and builds only from the `/blog` subdirectory.

## Tech Stack

| Category                 | Technologies                                           |
| :----------------------- | :----------------------------------------------------- |
| **Portfolio (Frontend)** | `HTML5`, `CSS3`, `JavaScript`                            |
| **Blog (SSG)**           | `Hugo`, `Markdown`, `Blowfish Theme`                     |
| **Platform & DevOps**    | `Git`, `GitHub Actions`, `Cloudflare Pages`, `Cloudflare DNS` |

---

## Getting Started Locally

You are welcome to clone this repository and use its structure as a template for your own sites.

### Prerequisites
*   [Git](https://git-scm.com/downloads)
*   [Hugo (Extended Version)](https://gohugo.io/installation/) is required to run the blog.

### Running the Portfolio Locally

The portfolio is a simple static site. To view it, you can just open the `index.html` file in your web browser.

### Running the Blog Locally

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/NaolMengistu/portfolio-website.git
    cd portfolio-website
    ```

2.  **Navigate to the blog directory:**
    ```bash
    cd blog
    ```

3.  **Run the Hugo development server:**
    ```bash
    hugo server
    ```

4.  Open your browser and navigate to `http://localhost:1313` to see the blog live.