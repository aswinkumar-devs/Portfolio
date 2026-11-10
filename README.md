# Aswin Kumar M — Portfolio

This is the complete React, TypeScript, and Vite source for Aswin Kumar M's portfolio. Netlify and Vercel deployment settings are included.

## Deploy to Netlify

1. Extract this ZIP and put the project in a GitHub repository.
2. In Netlify, choose **Add new site → Import an existing project** and connect that repository.
3. Deploy. Netlify reads `netlify.toml` automatically. The build command is `npm run build`, and the published folder is `dist`.

The included rewrite keeps the portfolio's page links working on direct visits and refreshes. To deploy the ZIP without GitHub, build it locally using the instructions below, then deploy the generated `dist` folder through the Netlify dashboard or Netlify CLI.

## Deploy to Vercel

1. Extract this ZIP and put the project in a GitHub repository.
2. In Vercel, choose **Add New → Project** and import that repository.
3. Deploy. Vercel reads `vercel.json` automatically; the build command is `npm run build`, and the output folder is `dist`.

The included rewrite keeps the portfolio's page links working on direct visits and refreshes. For deployment from the ZIP without GitHub, install Node.js 20 or later, extract the archive, and run `npm install`, `npm run build`, then `npx vercel --prod` from the extracted project folder.

## Run locally

Install Node.js 20 or later, then run:

```sh
npm install
npm run dev
```

To make a production build locally, run `npm run build`. The generated website is saved to `dist`; upload that folder when using a host's manual static-site upload.

## Contact form

The contact form uses the existing EmailJS configuration in the website. In your EmailJS account, confirm that its service and template are active and that the allowed website origins include your final hosting domain. The portfolio also includes the locally hosted profile, project images, résumé, and icons.
