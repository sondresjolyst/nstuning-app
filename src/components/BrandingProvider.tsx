"use client";

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import BrandingService, { Branding, toDataUrl } from '@/services/brandingService';

interface BrandingContextValue {
    branding: Branding;
    logoUrl: string | null;
    refresh: () => void;
}

const BrandingContext = createContext<BrandingContextValue>({ branding: {}, logoUrl: null, refresh: () => {} });

export const useBranding = () => useContext(BrandingContext);

export default function BrandingProvider({ children }: { children: React.ReactNode }) {
    const [branding, setBranding] = useState<Branding>({});

    const refresh = useCallback(() => {
        BrandingService.get().then(setBranding).catch(() => {});
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    useEffect(() => {
        const iconUrl = toDataUrl(branding.iconData, branding.iconContentType);
        if (!iconUrl) return;
        const existing = document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]');
        existing.forEach(el => el.remove());
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = iconUrl;
        document.head.appendChild(link);
    }, [branding.iconData, branding.iconContentType]);

    const logoUrl = toDataUrl(branding.logoData, branding.logoContentType);

    return (
        <BrandingContext.Provider value={{ branding, logoUrl, refresh }}>
            {children}
        </BrandingContext.Provider>
    );
}
