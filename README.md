Ecodesk - simple multi-page static structure

This repository was created by splitting a single monolithic `index.html` into a small, well-structured static site.

Files added:
- index.html        -> Home page
- about.html        -> About / timeline
- blog.html         -> Blog listing
- contact.html      -> Contact page with contact form and map visualization
- css/style.css     -> All styles extracted from the original file
- js/main.js        -> Shared JS with guarded, page-specific initialization

How to run:
- Open `index.html` (or any other `.html` file) in your browser.

Notes and next steps:
- Vendor libraries (Three.js, GSAP) are kept on a CDN. If you want them offline, download and place in `vendor/` and update the script tags.
- You can further refactor header/footer into server-side includes or use a static site generator to avoid duplication across pages.
- I kept the original visual styles and JS behavior but guarded page-specific features so errors won't occur on pages without related elements.
