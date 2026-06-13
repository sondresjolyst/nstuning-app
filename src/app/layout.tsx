import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Providers from "./providers";
import Navbar from "./navbar";
import Footer from "./footer";
import { COMPANY } from "@/lib/company";
import { publicGet } from "@/lib/publicApi";
import { Branding } from "@/services/brandingService";

export const metadata: Metadata = {
    metadataBase: new URL(COMPANY.url),
    title: {
        default: `${COMPANY.name} — Dyno & Performance Tuning`,
        template: `%s — ${COMPANY.name}`,
    },
    description: `Professional dyno tuning by ${COMPANY.name} (${COMPANY.legalName}). Real results, documented dyno runs.`,
    manifest: "/manifest.json",
    alternates: { canonical: "/" },
    robots: { index: true, follow: true },
    openGraph: {
        type: "website",
        siteName: COMPANY.name,
        url: COMPANY.url,
        title: `${COMPANY.name} — Dyno & Performance Tuning`,
        description: `Professional dyno tuning by ${COMPANY.name}. Real results, documented dyno runs.`,
    },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const branding = await publicGet<Branding>("/branding") ?? {};
    return (
        <html lang="no">
            <Script src="/register-sw.js" />
            <body className="min-h-screen flex flex-col bg-background text-foreground">
                <Providers initialBranding={branding}>
                    <Navbar />
                    <main className="flex-1">{children}</main>
                    <Footer />
                </Providers>
            </body>
        </html>
    );
}
