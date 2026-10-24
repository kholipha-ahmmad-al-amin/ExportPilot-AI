import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import seoConfig from '../../seo.config.json';
import { useAuth } from '../context/AuthContext';

type SeoRoute = (typeof seoConfig.routes)[number];

const normalizePath = (pathname: string) => {
  if (pathname === '/') return '/';
  return pathname.replace(/\/+$/, '') || '/';
};

export const getSeoRoute = (pathname: string): SeoRoute | undefined => {
  const path = normalizePath(pathname);
  return seoConfig.routes.find((route) => route.path === path);
};

const setMeta = (selector: string, attributes: Record<string, string>, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    Object.entries(attributes).forEach(([key, value]) => element?.setAttribute(key, value));
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

const setCanonical = (href: string) => {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    document.head.appendChild(element);
  }
  element.href = href;
};

const setStructuredData = (path: string, title: string, description: string, canonical: string, language: string) => {
  const orgUrl = `${seoConfig.siteUrl}/#organization`;
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Organization',
      '@id': orgUrl,
      name: seoConfig.organization.name,
      alternateName: seoConfig.alternateName,
      url: seoConfig.organization.url,
      logo: `${seoConfig.siteUrl}${seoConfig.organization.logo}`,
      description: seoConfig.organization.description,
    },
    {
      '@type': 'WebSite',
      '@id': `${seoConfig.siteUrl}/#website`,
      name: seoConfig.brandName,
      alternateName: seoConfig.alternateName,
      url: `${seoConfig.siteUrl}/`,
      inLanguage: ['bn-BD', 'en'],
      publisher: { '@id': orgUrl },
    },
    {
      '@type': ['SoftwareApplication', 'WebApplication'],
      '@id': `${seoConfig.siteUrl}/#application`,
      name: seoConfig.brandName,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: `${seoConfig.siteUrl}/`,
      description: seoConfig.defaultDescription,
      inLanguage: ['bn-BD', 'en'],
      creator: [
        { '@type': 'Organization', name: seoConfig.organization.creatorOrganization.name, url: seoConfig.organization.creatorOrganization.url },
        { '@type': 'Person', name: seoConfig.organization.creatorPerson.name, url: seoConfig.organization.creatorPerson.url, jobTitle: 'Lead Architect' },
      ],
    },
    {
      '@type': 'WebPage',
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: title,
      description,
      inLanguage: language === 'en' ? 'en' : 'bn-BD',
      isPartOf: { '@id': `${seoConfig.siteUrl}/#website` },
      about: { '@id': orgUrl },
    },
  ];

  if (path !== '/') {
    const route = getSeoRoute(path);
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${seoConfig.siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: route?.title || 'Page', item: canonical },
      ],
    });
  }

  if (path === '/') {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: seoConfig.homeFaqs.map((faq) => ({
        '@type': 'Question',
        name: language === 'en' ? faq.questionEn : faq.questionBn,
        acceptedAnswer: {
          '@type': 'Answer',
          text: language === 'en' ? faq.answerEn : faq.answerBn,
        },
      })),
    });
  }

  let script = document.getElementById('seo-structured-data') as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = 'seo-structured-data';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
};

export const SeoManager = () => {
  const { pathname } = useLocation();
  const { lang } = useAuth();

  useEffect(() => {
    const path = normalizePath(pathname);
    const route = getSeoRoute(path);
    const title = `${route?.title || seoConfig.defaultTitle} | ${seoConfig.brandName}`;
    const description = route?.description || seoConfig.defaultDescription;
    const canonicalPath = route?.canonical || route?.path || '/not-found';
    const canonical = `${seoConfig.siteUrl}${canonicalPath === '/' ? '/' : canonicalPath}`;
    const robots = route?.index ? 'index, follow' : 'noindex, nofollow';
    const image = `${seoConfig.siteUrl}${seoConfig.socialImage}`;

    document.documentElement.lang = lang === 'en' ? 'en' : 'bn-BD';
    document.title = title;
    setMeta('meta[name="description"]', { name: 'description' }, description);
    setMeta('meta[name="robots"]', { name: 'robots' }, robots);
    setMeta('meta[property="og:type"]', { property: 'og:type' }, 'website');
    setMeta('meta[property="og:site_name"]', { property: 'og:site_name' }, seoConfig.brandName);
    setMeta('meta[property="og:title"]', { property: 'og:title' }, title);
    setMeta('meta[property="og:description"]', { property: 'og:description' }, description);
    setMeta('meta[property="og:url"]', { property: 'og:url' }, canonical);
    setMeta('meta[property="og:image"]', { property: 'og:image' }, image);
    setMeta('meta[property="og:locale"]', { property: 'og:locale' }, lang === 'en' ? 'en_US' : 'bn_BD');
    setMeta('meta[name="twitter:card"]', { name: 'twitter:card' }, 'summary_large_image');
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, title);
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, description);
    setMeta('meta[name="twitter:image"]', { name: 'twitter:image' }, image);
    setCanonical(canonical);
    setStructuredData(path, title, description, canonical, lang);
  }, [pathname, lang]);

  return null;
};
