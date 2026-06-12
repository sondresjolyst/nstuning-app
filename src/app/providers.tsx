"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import BrandingProvider from "@/components/BrandingProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <BrandingProvider>
                {children}
                <Toaster richColors position="top-center" />
            </BrandingProvider>
        </SessionProvider>
    );
}
