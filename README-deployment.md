# SESKROW Deployment Guide

## Option 1: Netlify Deployment

### Prerequisites
- Netlify account
- GitHub repository with your code

### Steps
1. Push your code to GitHub
2. Connect GitHub to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variables in Netlify dashboard:
   - `GROQ_API_KEY` (your GroqAI key)
   - `DATABASE_URL` (your PostgreSQL connection string)

### Build Settings
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 18

## Option 2: WordPress Panel Upload

### Static Site Generation
1. Run `npm run build` locally
2. Upload the `dist` folder contents to your WordPress hosting
3. Place files in your domain's public folder (usually `public_html`)

### WordPress Integration Options

#### Option A: Custom Page Template
Create a custom page template in your WordPress theme:

\`\`\`php
<?php
/*
Template Name: SESKROW App
*/
get_header(); ?>

<div id="seskrow-app">
    <!-- Your React app will mount here -->
</div>

<script src="/path/to/your/built-js-files"></script>
<link rel="stylesheet" href="/path/to/your/built-css-files">

<?php get_footer(); ?>
\`\`\`

#### Option B: Subdomain Setup
1. Create a subdomain (e.g., app.yourdomain.com)
2. Point subdomain to a separate folder
3. Upload built files to that folder
4. Configure DNS settings

#### Option C: WordPress Plugin Approach
1. Create a simple WordPress plugin
2. Enqueue your built CSS/JS files
3. Add shortcode to display the app

### File Structure for WordPress
\`\`\`
your-wordpress-site/
├── wp-content/
│   ├── themes/your-theme/
│   │   ├── seskrow-template.php
│   │   └── functions.php (enqueue scripts)
├── seskrow-app/ (your built files)
│   ├── index.html
│   ├── assets/
│   └── ...
\`\`\`

### Important Notes
- Static hosting won't support the full backend features
- You'll need a separate hosting solution for the API endpoints
- Consider using WordPress REST API for data if integrating deeply

## Recommended Approach
For full functionality, use Netlify or similar platform that supports both frontend and serverless functions.
