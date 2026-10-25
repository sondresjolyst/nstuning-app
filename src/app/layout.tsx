import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Providers from "./providers";
import Navbar from "./navbar";
import Footer from "./footer";
import { COMPANY } from "@/lib/company";
import { publicGetOptional } from "@/lib/publicApi";
import { Branding } from "@/services/brandingService";
import { REVALIDATE_TARGETS } from "@/lib/cacheTags";
import { getCompanyInfo } from "@/lib/companyInfo";

export const metadata: Metadata = {
    metadataBase: new URL(COMPANY.url),
    title: {
        default: `${COMPANY.name} — Dyno & Performance Tuning`,
        template: `%s — ${COMPANY.name}`,
    },
    description: `Professional dyno tuning by ${COMPANY.name} (${COMPANY.legalName}). Real results, documented dyno runs.`,
    manifest: "/manifest.json",
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
    const [branding, company] = await Promise.all([
        publicGetOptional<Branding>("/branding", { tags: [REVALIDATE_TARGETS.branding] }).then(b => b ?? {}),
        getCompanyInfo(),
    ]);
    return (
        <html lang="en">
            <Script src="/register-sw.js" />
            <body className="min-h-screen flex flex-col bg-background text-foreground">
                <Providers initialBranding={branding}>
                    <Navbar />
                    <main className="flex-1">{children}</main>
                    <Footer company={company} />
                </Providers>
            </body>
        </html>
    );
}
