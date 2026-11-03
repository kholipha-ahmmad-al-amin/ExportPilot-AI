import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const frontendDir = resolve(scriptDir, '..');
const publicDir = resolve(frontendDir, 'public');
const configPath = resolve(frontendDir, 'seo.config.json');
const config = JSON.parse(await readFile(configPath, 'utf8'));
const generatedDate = new Date().toISOString().slice(0, 10);

await mkdir(publicDir, { recursive: true });
await copyFile(configPath, resolve(publicDir, 'seo-config.json'));

const restrictedPaths = [
  '/admin', '/app', '/dealroom', '/buyers', '/catalog', '/dashboard',
  '/data', '/security', '/architecture', '/audit', '/api/',
];
const botAgents = ['Googlebot', 'Bingbot', 'GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', '*'];
const robots = [
  ...botAgents.flatMap((agent) => [
    `User-agent: ${agent}`,
    'Allow: /',
    ...restrictedPaths.map((path) => `Disallow: ${path}`),
    '',
  ]),
  `Sitemap: ${config.siteUrl}/sitemap.xml`,
  '',
].join('\n');
await writeFile(resolve(publicDir, 'robots.txt'), robots, 'utf8');

const indexableRoutes = config.routes
  .filter((route) => route.index)
  .sort((left, right) => left.path.localeCompare(right.path));
const sitemapUrls = indexableRoutes.map((route) => {
  const location = `${config.siteUrl}${route.path === '/' ? '/' : route.path}`;
  return [
    '  <url>',
    `    <loc>${location}</loc>`,
    `    <lastmod>${generatedDate}</lastmod>`,
    `    <changefreq>${route.changefreq}</changefreq>`,
    `    <priority>${Number(route.priority).toFixed(1)}</priority>`,
    '  </url>',
  ].join('\n');
});
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...sitemapUrls,
  '</urlset>',
  '',
].join('\n');
await writeFile(resolve(publicDir, 'sitemap.xml'), sitemap, 'utf8');

const publishedRoutes = indexableRoutes.map((route) => `- [${route.title}](${config.siteUrl}${route.path === '/' ? '/' : route.path}): ${route.description}`);
const llms = [
  `# ${config.brandName}`,
  '',
  `> ${config.defaultDescription}`,
  '',
  `Canonical site: ${config.siteUrl}/`,
  'Languages: Bangla and English.',
  'Audience: Bangladesh-based manufacturers and export teams.',
  'Business area: product classification research, buyer requirement review, estimated Scope 2 emissions, and draft export document preparation.',
  'Primary action: create an account to prepare product and shipment information.',
  '',
  '## Public pages',
  ...publishedRoutes,
  '',
  '## Accuracy notes',
  'Tariff eligibility, rules of origin, customs classification, carbon reporting methods, and contract terms require confirmation with the relevant authorities and counterparties.',
  'Buyer and product examples shown in the interface may be illustrative. Verify identity, capacity, product specifications, and commercial terms independently.',
  '',
].join('\n');
await writeFile(resolve(publicDir, 'llms.txt'), llms, 'utf8');

const llmsFull = [
  `# ${config.brandName}: business and platform reference`,
  '',
  `## Organization`,
  `Name: ${config.organization.name}`,
  `Alternate name: ${config.alternateName}`,
  `Website: ${config.siteUrl}/`,
  `Description: ${config.organization.description}`,
  `Built by: ${config.organization.creatorOrganization.name} (${config.organization.creatorOrganization.url})`,
  `Product architect: ${config.organization.creatorPerson.name} (${config.organization.creatorPerson.url})`,
  '',
  '## Users and use',
  'The platform is designed for Bangladesh manufacturers and export teams. The interface supports Bangla and English. It helps teams organize product information, review buyer requirements, prepare classification research, estimate electricity-related emissions, and draft trade documents.',
  '',
  '## Work areas',
  '- Product records: descriptions, materials, dimensions, capacity, and shipment inputs.',
  '- HS code research: organize product facts and review a proposed classification with a customs professional.',
  '- Buyer review: compare order quantity, target price, delivery, packaging, and payment requirements. Verify buyer identity independently.',
  '- Carbon estimate: organize electricity consumption and the emissions factor used. The estimate is not third-party assurance.',
  '- Document drafts: prepare commercial information for a proforma invoice and deal record. Drafts require review before issue.',
  '',
  '## Public pages',
  ...publishedRoutes,
  '',
  '## Trade and compliance limits',
  'The platform does not make customs decisions, certify product origin, guarantee tariff treatment, certify food safety, provide third-party carbon assurance, or replace legal, banking, or customs advice. Confirm applicable requirements for the specific product and destination before shipment.',
  'Trade agreement benefits depend on current rules, product classification, origin evidence, and destination procedures. Do not infer a duty rate from a general market page.',
  '',
  '## Contact and attribution',
  `Agency: ${config.organization.creatorOrganization.url}`,
  `Company: https://equisaas-bd.com/`,
  `Architect: ${config.organization.creatorPerson.url}`,
  '',
].join('\n');
await writeFile(resolve(publicDir, 'llms-full.txt'), llmsFull, 'utf8');

console.log(`Generated SEO assets for ${indexableRoutes.length} indexable routes (${generatedDate}).`);
