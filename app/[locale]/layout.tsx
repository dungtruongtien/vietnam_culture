import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Be_Vietnam_Pro, Cormorant_Garamond } from 'next/font/google';
import type { Metadata } from 'next';
import Script from 'next/script';
import SideAds from '@/components/SideAds';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-body',
  display: 'swap',
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-heading',
  display: 'swap',
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isVi = locale === 'vi';
  return {
    title: {
      default: isVi ? 'Khám Phá Việt Nam' : 'Explore Vietnam',
      template: isVi ? '%s | Khám Phá Việt Nam' : '%s | Explore Vietnam',
    },
    description: isVi
      ? 'Tìm hiểu lịch sử, văn hóa và ẩm thực các tỉnh thành Việt Nam'
      : "Discover the history, culture and cuisine of Vietnam's provinces",
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'vi' | 'en')) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${beVietnamPro.variable} ${cormorantGaramond.variable}`}
    >
      {process.env.NEXT_PUBLIC_GA_ID && (
        <head>
          <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
          <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        </head>
      )}
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
          <SideAds />
        </NextIntlClientProvider>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} strategy="afterInteractive" />
            <Script id="gtag-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
            `}</Script>
          </>
        )}
      </body>
    </html>
  );
}
