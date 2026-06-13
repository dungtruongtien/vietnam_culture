import type { MetadataRoute } from 'next';
import { getAllProvinces } from '@/lib/queries';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const provinces = await getAllProvinces();
  const locales = ['vi', 'en'] as const;

  const homepages = locales.map((locale) => ({
    url: `${SITE_URL}/${locale}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1,
  }));

  const provincePages = provinces.flatMap((province) =>
    locales.map((locale) => ({
      url: `${SITE_URL}/${locale}/${locale === 'vi' ? province.type : province.type_en}/${province.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  );

  return [...homepages, ...provincePages];
}
