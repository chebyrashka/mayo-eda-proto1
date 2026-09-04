import type { Metadata } from 'next';
import './mayo-fonts.css';
import './globals.css';
export const metadata: Metadata = {
	title: 'Explore what’s possible | Mayo Clinic Platform',
	description:
		'A concept experience for exploring healthcare innovation through conversation and curated Mayo Clinic Platform resources.',
	robots: { index: false, follow: false },
};
export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<head>
				<link
					rel="preconnect"
					href="https://www.mayoclinic.org"
					crossOrigin="anonymous"
				/>
			</head>
			<body>{children}</body>
		</html>
	);
}
