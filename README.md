# Bahman Noushabadi - Professional Portfolio

A state-of-the-art, dynamic portfolio website built with **Next.js 16**, featuring Server-Side Rendering (SSR), a custom Firebase CMS, and an automated deployment pipeline to Namecheap shared hosting.

## 🚀 Features

* **Zero-Flash SSR Architecture**: Profile data is fetched from the Firebase REST API on the server before the page reaches the browser, ensuring an instant, SEO-friendly load with no placeholder flashing.
* **Firebase CMS**: All text content, skills, experience, and gallery images are managed remotely via Firebase Firestore, allowing real-time updates without touching the code.
* **Premium Interactive UI**:
  * **Particle Backgrounds**: Smooth, dynamic particle animations.
  * **Scroll Theme Manager**: The application seamlessly transitions color palettes based on the user's scroll position.
  * **Glassmorphism Design**: Sleek, modern, frosted-glass components.
  * **3D Tilt Cards**: Interactive hover effects on the hero section.
* **Automated CI/CD Pipeline**: GitHub Actions automatically builds the Next.js `standalone` package and uses parallel `LFTP` mirroring to deploy to Namecheap in minutes.

## 🛠 Tech Stack

* **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Server Components)
* **Styling**: Vanilla CSS (CSS Modules & Custom Properties)
* **Backend/CMS**: [Firebase Firestore](https://firebase.google.com/)
* **Deployment**: GitHub Actions + LFTP Parallel Sync -> Namecheap Node.js Selector

## 📂 Project Structure

```text
├── src/
│   ├── app/
│   │   ├── admin/       # Secure CMS administration panel
│   │   ├── page.js      # Main Server Component (SSR Data Fetching)
│   │   └── layout.js    # Root layout
│   ├── components/      # Interactive Client Components (Hero, About, Particles, etc.)
│   └── lib/
│       └── firebase.js  # Firebase configuration and initialization
├── .github/workflows/
│   └── deploy.yml       # CI/CD pipeline configuration
└── next.config.mjs      # Next.js config (Standalone mode enabled)
```

## ⚙️ Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/portfolio-website.git
   cd portfolio-website
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Firebase**:
   Ensure your `src/lib/firebase.js` is configured with your project credentials.

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## 🚢 Deployment (Namecheap cPanel)

This project uses a highly optimized GitHub Actions workflow to deploy to Namecheap shared hosting using a Node.js Selector.

### How it works:
1. Pushing to the `main` branch triggers the `deploy.yml` workflow.
2. Next.js creates an optimized `standalone` build.
3. The workflow uses `lftp --parallel=10` to mirror the compiled files directly to the server, bypassing traditional FTP timeouts.
4. A `restart.txt` marker is updated to force the cPanel Node.js passenger to reboot the app.

### Required GitHub Secrets:
To enable automated deployments, configure the following secrets in your GitHub repository:
* `FTP_SERVER`: Your FTP host (e.g., `ftp.yourdomain.com`)
* `FTP_USERNAME`: Your cPanel FTP username
* `FTP_PASSWORD`: Your cPanel FTP password

---
*Designed and built with AI assistance.*
