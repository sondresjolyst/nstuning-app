import { defineSite } from '@sjolystinnovation/app-kit/seo';
import { COMPANY } from '@/lib/company';

/** The URL, robots and structured data helpers for this site. */
export const site = defineSite({ name: COMPANY.name, url: COMPANY.url, titleSeparator: ' | ' });
