---
title: "How I Built a Hybrid CI/CD Pipeline for My Portfolio and Blog"
description: "A detailed, step-by-step tutorial on hosting a static portfolio and a Hugo blog on separate domains from a single GitHub repository using GitHub Pages and Cloudflare Pages."
categories: ["Tutorial", "DevOps"]
tags: ["CI/CD", "Hugo", "Cloudflare", "GitHubActions", "Monorepo"]
date: 2025-03-28 
---

As a developer and security professional, I wanted my online presence to be more than just a resume, I wanted it to be a live demonstration of my skills. My goal was to host two distinct sites: a static portfolio at `naol.dev` and a technical blog at `blog.naol.dev`. The challenge? I wanted to manage both from a single GitHub repository, a `monorepo` with a fully automated deployment pipeline.

This isn't supported by GitHub Pages, which only serves one site per repository. But by combining the strengths of GitHub Actions, Cloudflare Pages, and Cloudflare DNS, I built a seamless, hybrid CI/CD pipeline that does exactly what I need.

This article is the complete, step-by-step guide on how I did it, and how you can too.

### The Architectural Overview

Before we dive in, let's look at the final architecture. This is a hybrid hosting model that leverages the best tool for each job.

1.  **Source Code:** A single GitHub repository with a `main` branch. The root contains the portfolio's static files, and a `/blog` subdirectory contains the Hugo source code.
2.  **Portfolio (`naol.dev`):** Deployed via a **GitHub Actions** workflow to **GitHub Pages**. This workflow is smart and only runs when portfolio files are changed.
3.  **Blog (`blog.naol.dev`):** Deployed via **Cloudflare Pages**. This service connects directly to the GitHub repo and is configured to only build from the `/blog` subdirectory.
4.  **DNS & Routing:** **Cloudflare DNS** sits in front of everything, directing traffic for each domain to the correct hosting platform.

 {{< figure src="/images/cicd-architecture.svg" class="figure-wide">}}

<p align="center"><strong>Figure: Hybrid CI/CD Pipeline Architecture</strong></p>

Now, let's walk through how to set this up, step by step.

### Step 1: Local Project Structure

A clean local structure is key. In your main project folder, you should have two distinct parts:

```
portfolio-website/
├── .github/workflows/    # Will contain our deployment workflow
├── assets/             # Assets for the main portfolio
├── blog/             # The complete Hugo project lives here
│   ├── content/    # Blog posts are stored here
│   ├── themes/
│   └── assets/
├── .gitignore
├── index.html           # Main portfolio page
└── style.css          # Main portfolio stylesheet
```

### Step 2: Setting Up Cloudflare DNS

Before we configure any deployments, we need to tell the internet where to send traffic. We'll use Cloudflare to manage our DNS.

1.  **Sign up for a free Cloudflare account** and add your domain, in my case (`naol.dev`).
2.  **Change Nameservers:** Follow Cloudflare's instructions to update your nameservers at your domain registrar (e.g., Namecheap). This officially puts Cloudflare in control.
3.  **Configure DNS Records:** In the Cloudflare DNS dashboard, you need two sets of records:
    *   **For the Portfolio (`naol.dev`):** Four `A` records pointing your root domain (`@` or `naol.dev`) to the GitHub Pages IP addresses. Ensure the "Proxy status" cloud is **orange**.
        ```
        A   naol.dev   185.199.108.153   Proxied
        A   naol.dev   185.199.109.153   Proxied
        A   naol.dev   185.199.110.153   Proxied
        A   naol.dev   185.199.111.153   Proxied
        ```
    *   **For the Blog (`blog.naol.dev`):** You just need a placeholder `CNAME` record. Cloudflare Pages will manage this for you later, but creating it now is good practice.
        ```
        CNAME   blog   your-username.github.io   Proxied
        ```

### Step 3: Deploying the Blog with Cloudflare Pages

We'll set up the blog first, as it's a straightforward process.

1.  In your Cloudflare dashboard, navigate to **Workers & Pages**.
2.  Click **Create application > Pages > Connect to Git**.
3.  Select your `portfolio-website` repository.
4.  In the **Build settings**, configure it as follows:
    *   **Project name:** `blog` or anything you want
    *   **Production branch:** `main`
    *   **Framework preset:** `Hugo`
    *   **Build command:** `hugo`
    *   **Build output directory:** `public`
    *   **Root Directory (advanced):** `blog`  <-- **This is important.**
5.  Click **Save and Deploy**. Cloudflare will now build and deploy your blog from the `/blog` subdirectory.
6.  Once deployed, go to the project's **Custom domains** tab and add `blog.naol.dev`. Cloudflare will verify it automatically.

### Step 4: Deploying the Portfolio with GitHub Actions

Now, let's create the workflow that handles your main site.

1.  In your local repository, create a file at `.github/workflows/static.yml`.
2.  Paste the following code into the file. This workflow is smart, it will *not* run if you only change files inside the `/blog` folder.

```yaml
# .github/workflows/static.yml

name: Deploy Main Portfolio

on:
  push:
    branches: ["main"]
  paths-ignore:
    - 'blog/**' # Won't run when only blog files are changed
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "github-pages"
  cancel-in-progress: true

jobs:
  deploy:
    name: Deploy Portfolio Website (naol.dev)
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
      - name: Setup Pages
        uses: actions/configure-pages@v5
      - name: Upload Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

3.  Finally, configure your repository's GitHub Pages settings:
    *   Go to **Settings > Pages**.
    *   Set the source to **GitHub Actions**.
    *   Set the custom domain to `naol.dev`.

### The Final Workflow in Action

Now, your entire CI/CD pipeline is live.
*   **When you push changes to your portfolio files** (like `index.html`), the `static.yml` workflow triggers, updating your site at `naol.dev`.
*   **When you push changes to your blog files** (anything inside the `blog/` folder), the portfolio workflow is skipped, and Cloudflare Pages automatically detects the change, builds your Hugo site, and updates your blog at `blog.naol.dev`.

This hybrid approach gives you the best of both worlds: the simplicity of GitHub Pages for your static site and the powerful, monorepo-aware build capabilities of Cloudflare Pages for your blog, all managed from a single, clean repository.

If you want to see the final code, the workflow files, and the structure in action, you can check out the public repository for this project right here:
- [**Github.com/NaolMengistu/portfolio-website**](https://github.com/NaolMengistu/portfolio-website)
