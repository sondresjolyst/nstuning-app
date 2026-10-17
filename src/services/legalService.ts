import { createLegalService, type LegalPage as AppKitLegalPage } from '@sjolystinnovation/app-kit/api';
import { LEGAL_PAGE_KEYS } from '@sjolystinnovation/app-kit/seo';
import axiosInstance from './axiosInstance';
import publicClient from './publicClient';
import { REVALIDATE_TARGETS, revalidateTarget } from '@/lib/cacheTags';

export const LEGAL_KEYS = LEGAL_PAGE_KEYS;

export type LegalKey = (typeof LEGAL_KEYS)[number];

export type LegalPage = AppKitLegalPage<LegalKey>;

/** The site is written in English only, so every legal page has this one locale. */
export const LEGAL_LOCALE = 'en';

const LegalService = createLegalService<LegalKey>(axiosInstance, publicClient, {
    onSaved: () => revalidateTarget(REVALIDATE_TARGETS.legal),
});

export default LegalService;
