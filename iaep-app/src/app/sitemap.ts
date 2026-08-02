// src/app/sitemap.ts

import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const baseUrl = 'https://apasific.org';

  // 1. Static Routes
  const staticRoutes = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/journals`, lastModified: new Date() },
    { url: `${baseUrl}/editorial-board`, lastModified: new Date() },
    { url: `${baseUrl}/organization-structure`, lastModified: new Date() },
    { url: `${baseUrl}/certification-structure`, lastModified: new Date() },
    { url: `${baseUrl}/policies/peer-review`, lastModified: new Date() },
    { url: `${baseUrl}/policies/ethics`, lastModified: new Date() },
    { url: `${baseUrl}/policies/plagiarism`, lastModified: new Date() },
    { url: `${baseUrl}/policies/conflict-of-interest`, lastModified: new Date() },
    { url: `${baseUrl}/policies/open-access`, lastModified: new Date() },
    { url: `${baseUrl}/policies/preservation`, lastModified: new Date() },
    { url: `${baseUrl}/authors/guidelines`, lastModified: new Date() },
  ];

  // 2. Fetch all published article ids
  try {
    const { data: articles } = await supabase
      .from('submissions')
      .select('id, updated_at')
      .eq('status', 'Published');

    const dynamicRoutes = (articles || []).map((art: any) => ({
      url: `${baseUrl}/article/${art.id}`,
      lastModified: art.updated_at ? new Date(art.updated_at) : new Date()
    }));

    return [...staticRoutes, ...dynamicRoutes];
  } catch (e) {
    console.error("Error generating dynamic sitemap:", e);
    return staticRoutes;
  }
}
