import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Navbar from "./navbar";
import Footer from "./footer";

export const metadata: Metadata = {
    title: "NS Tuning — Dyno & Performance Tuning",
    description: "Professional dyno tuning by NS Tuning (Nordmark Service). Real results, documented dyno runs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="no">
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
