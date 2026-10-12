import type { Metadata } from 'next';
import { brands, DEFAULT_BRAND } from '@/branding/brands';
import './globals.css';
const brandMetadata = brands[DEFAULT_BRAND].metadata;
export const metadata: Metadata = {
  title: brandMetadata.title,
  description: brandMetadata.description,
  icons: { icon: { url: brandMetadata.favicon, type: 'image/svg+xml', sizes: 'any' } },
  robots: { index: false, follow: false },
};
export default function RootLayout({children}: {children: React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}
