import { createLegalService, type LegalPage as AppKitLegalPage } from '@sjolystinnovation/app-kit/api';
import axiosInstance from './axiosInstance';
import publicClient from './publicClient';
import { REVALIDATE_TARGETS, revalidateTarget } from '@/lib/cacheTags';

/** The site is written in English only, so every legal page has this one locale. */
export const LEGAL_LOCALE = 'en';

const LegalService = createLegalService(axiosInstance, publicClient, {
    onSaved: () => revalidateTarget(REVALIDATE_TARGETS.legal),
});

export type LegalKey = (typeof LegalService.keys)[number];

export type LegalPage = AppKitLegalPage<LegalKey>;

export default LegalService;
