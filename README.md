This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Search discovery and sitemap submission

Next.js serves `/sitemap.xml` from `app/sitemap.ts`; new entries in `app/data/blogs.json` are included automatically. `/robots.txt` advertises the sitemap. Submit `https://pyronite.in/sitemap.xml` once in [Google Search Console](https://search.google.com/search-console) for the verified site property.

A GitHub Actions workflow (`submit-sitemap.yml`) can re-submit the **live production sitemap** after each push to `main`, or manually via `workflow_dispatch`. To enable it:

1. Verify `https://pyronite.in/` (or `sc-domain:pyronite.in`) in Search Console. Add a Google Cloud service account as a **site owner** in Search Console and enable the Search Console API on its project.
2. Store its JSON key as the GitHub Actions secret `GSC_SERVICE_ACCOUNT_JSON` (never commit the key). Set the Actions variable `GSC_SITE_URL` to the *exact* verified property identifier if not using the default `https://pyronite.in/` (include the trailing slash for URL-prefix properties).
3. Deploy `main` to production. The workflow waits up to 15 minutes for the live sitemap to include the blog URLs in the pushed commit, then submits it to the Search Console Sitemaps API. If deployment is slower, rerun it manually after deployment. For deployments not driven by pushes to `main`, trigger the workflow after production deployment.

Without the secret the workflow logs a warning and skips submission; robots.txt and the sitemap still work. Submission requests discovery, **not immediate recrawling, indexing, or a ranking guarantee**. Google retired the old unauthenticated sitemap ping endpoint; do not use it. For changed blog content, set the optional `updatedISO` field to the actual update date; otherwise the sitemap uses the publication `dateISO`. For a new static page, also add its route to `app/sitemap.ts`. Never advertise a false `lastmod`.
