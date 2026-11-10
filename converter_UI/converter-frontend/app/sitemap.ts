import { MetadataRoute } from 'next';
import { conversionToolsIndex } from './data/tools';

// Force static rendering structures across compile runtime layers
export const dynamic = 'force-static';
export const revalidate = false; // ◄ ADD THIS DEFINITIVE LINE HERE

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseDomain = "https://modifier.online";

  // 1. Establish the main landing page route path coordinate
  const foundationalIndexRoute = [
    {
      url: `${baseDomain}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    }
  ];

  // 2. Programmatically map out all active tools variations inside the array
  const dynamicToolRoutes = conversionToolsIndex.map((tool) => ({
    url: `${baseDomain}/tools/${tool.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...foundationalIndexRoute, ...dynamicToolRoutes];
}
