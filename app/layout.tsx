import type { Metadata } from 'next';
import { brands, DEFAULT_BRAND } from '@/branding/brands';
import './globals.css';
const brandMetadata = brands[DEFAULT_BRAND].metadata;
const social = 'social' in brandMetadata ? brandMetadata.social : null;
export const metadata: Metadata = {
  title: brandMetadata.title,
  description: brandMetadata.description,
  icons: { icon: { url: brandMetadata.favicon, type: 'image/svg+xml', sizes: 'any' } },
  openGraph: social ? {
    type: 'website',
    url: social.url,
    siteName: social.siteName,
    title: brandMetadata.title,
    description: brandMetadata.description,
    images: [social.image],
  } : undefined,
  twitter: social ? {
    card: 'summary_large_image',
    title: brandMetadata.title,
    description: brandMetadata.description,
    images: [social.image],
  } : undefined,
  robots: { index: false, follow: false },
};
export default function RootLayout({children}: {children: React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}
