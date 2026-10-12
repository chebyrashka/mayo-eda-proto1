'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { brands, DEFAULT_BRAND, getBrandName } from './brands';

function readBrand() {
	return getBrandName(window.location.search);
}

function subscribe(onChange: () => void) {
	window.addEventListener('popstate', onChange);
	return () => window.removeEventListener('popstate', onChange);
}

// Use the default for static HTML and hydration, then read the URL in the browser.
function serverBrand() {
	return DEFAULT_BRAND;
}

export function useBrand() {
	const name = useSyncExternalStore(subscribe, readBrand, serverBrand);
	const config = brands[name];
	useEffect(() => {
		// Static HTML uses the default brand; explicit URL selections update the head.
		document.title = config.metadata.title;
		let description = document.head.querySelector<HTMLMetaElement>(
			'meta[name="description"]',
		);
		if (!description) {
			description = document.createElement('meta');
			description.name = 'description';
			document.head.appendChild(description);
		}
		description.content = config.metadata.description;
		let favicon = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]');
		if (!favicon) {
			favicon = document.createElement('link');
			favicon.rel = 'icon';
			document.head.appendChild(favicon);
		}
		favicon.type = 'image/svg+xml';
		favicon.setAttribute('sizes', 'any');
		favicon.href = config.metadata.favicon;
	}, [config]);
	return {
		name,
		...config,
		// Placeholder links stay in this tab and preserve the selected brand.
		linkProps(href: string) {
			return config.placeholderLinks
				? { href: '#' }
				: { href, target: '_blank', rel: 'noreferrer' };
		},
	};
}
