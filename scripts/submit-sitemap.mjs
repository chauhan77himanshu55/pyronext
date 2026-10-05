/** Verify the deployed sitemap before requesting a Search Console refresh. */
import { readFile } from 'node:fs/promises';

const base = 'https://pyronite.in';
const sitemap = `${base}/sitemap.xml`;
const posts = JSON.parse(await readFile(new URL('../app/data/blogs.json', import.meta.url), 'utf8'));
const expected = [base, `${base}/blogs`, ...posts.map((post) => `${base}/blogs/${post.slug}`)];
const token = process.env.GSC_ACCESS_TOKEN;
const site = process.env.GSC_SITE_URL || `${base}/`;

if (!token) throw new Error('Missing GSC_ACCESS_TOKEN. Configure GSC_SERVICE_ACCOUNT_JSON in GitHub Actions.');

// The push can precede production deployment. Do not submit a stale sitemap.
let ready = false;
for (let attempt = 1; attempt <= 15; attempt++) {
  try {
    const response = await fetch(sitemap, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const xml = await response.text();
    const urls = new Set([...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)].map((match) => match[1].trim().replaceAll('&amp;', '&')));
    const missing = expected.filter((url) => !urls.has(url));
    if (missing.length === 0) { ready = true; break; }
    console.log(`Attempt ${attempt}: deployed sitemap missing ${missing.length} expected URLs (e.g. ${missing[0]}).`);
  } catch (error) {
    console.log(`Attempt ${attempt}: ${error.message}`);
  }
  if (attempt < 15) await new Promise((resolve) => setTimeout(resolve, 60_000));
}
if (!ready) throw new Error('Production sitemap did not include all expected blog URLs after 15 minutes. Check deployment and rerun this workflow.');

const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/sitemaps/${encodeURIComponent(sitemap)}`;
const response = await fetch(endpoint, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
if (!response.ok) throw new Error(`Search Console submission failed (${response.status}): ${await response.text()}`);
console.log(`Submitted ${sitemap} for Search Console property ${site}. Submission does not guarantee crawling or indexing.`);
