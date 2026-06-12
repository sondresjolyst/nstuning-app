import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Providers from "./providers";
import Navbar from "./navbar";
import Footer from "./footer";
import { COMPANY } from "@/lib/company";

export const metadata: Metadata = {
    title: `${COMPANY.name} — Dyno & Performance Tuning`,
    description: `Professional dyno tuning by ${COMPANY.name} (${COMPANY.legalName}). Real results, documented dyno runs.`,
    manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="no">
            <Script src="/register-sw.js" />
            <body className="min-h-screen flex flex-col bg-background text-foreground">
                <Providers>
                    <Navbar />
                    <main className="flex-1">{children}</main>
                    <Footer />
                </Providers>
            </body>
        </html>
    );
}
