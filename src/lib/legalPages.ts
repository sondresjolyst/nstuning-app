import { publicGet } from '@/lib/publicApi';
import { REVALIDATE_TARGETS } from '@/lib/cacheTags';
import { LEGAL_LOCALE, type LegalKey, type LegalPage } from '@/services/legalService';

/** Fetches a legal page as an admin wrote it, or null while it has not been written. */
export function getLegalPage(key: LegalKey): Promise<LegalPage | null> {
    return publicGet<LegalPage>(`/content/legal/${key}?locale=${LEGAL_LOCALE}`, { tags: [REVALIDATE_TARGETS.legal] });
}
