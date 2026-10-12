import original from './original/config.json';
import alternative from './alternative/config.json';

export const brands = { original, alternative };
export type BrandName = keyof typeof brands;
export const DEFAULT_BRAND: BrandName = 'alternative';

export function getBrandName(search: string): BrandName {
	const name = new URLSearchParams(search).get('brand');
	return name === 'original' || name === 'alternative' ? name : DEFAULT_BRAND;
}
