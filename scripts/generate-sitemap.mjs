import { writeFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

const SITE_URL = process.env.SITE_URL?.replace(/\/$/, '') || 'https://vetwraps.com'
const dist = resolve(process.cwd(), 'dist')

const routes = [
  '/',
  '/case-studies',
  '/case-studies/precision-esports',
  '/case-studies/northline-logistics',
  '/whats-new'
  // Note: /subscribers intentionally excluded
]

const now = new Date().toISOString()
const items = routes.map((path) => `  <url>\n    <loc>${SITE_URL}${path}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${path === '/' ? '1.0' : '0.7'}</priority>\n  </url>`).join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>\n`

await mkdir(dist, { recursive: true })
await writeFile(resolve(dist, 'sitemap.xml'), xml)
console.log('sitemap.xml generated for', SITE_URL)

