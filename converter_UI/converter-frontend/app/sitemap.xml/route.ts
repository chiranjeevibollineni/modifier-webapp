import { NextResponse } from 'next/server';
import { conversionToolsIndex } from '../data/tools'; // Adjusted path up one level

export const dynamic = 'force-static';
export const revalidate = false;

export async function GET() {
  const baseDomain = "https://peoplepulse.online";

  // 1. Core mapping parameters
  const toolsXML = conversionToolsIndex.map((tool) => `
    <url>
      <loc>${baseDomain}/tools/${tool.slug}</loc>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.8</priority>
    </url>
  `).join('');

  // 2. Wrap into a valid standard XML schema string format
  const sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://sitemaps.org">
    <url>
      <loc>${baseDomain}/</loc>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>1.0</priority>
    </url>
    ${toolsXML}
  </urlset>`;

  return new NextResponse(sitemapXML, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
