"use client";

import { LegalPagesEditor } from '@sjolystinnovation/app-kit/admin';
import LegalService, { LEGAL_LOCALE } from '@/services/legalService';

const keyLabels = { terms: 'Terms of Service', privacy: 'Privacy Policy', cookies: 'Cookie Policy' };

export default function AdminLegalPage() {
    return (
        <LegalPagesEditor
            service={LegalService}
            keyLabels={keyLabels}
            locales={[LEGAL_LOCALE]}
            localeLabels={{ [LEGAL_LOCALE]: 'English' }}
        />
    );
}
