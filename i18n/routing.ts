import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['vi', 'en'],
  defaultLocale: 'vi',
  pathnames: {
    '/': '/',
    '/[type]/[slug]': {
      vi: '/[type]/[slug]',
      en: '/[type]/[slug]',
    },
  },
});
