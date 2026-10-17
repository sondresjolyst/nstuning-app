import type { Metadata } from "next";
import { LegalPageView } from "@sjolystinnovation/app-kit/legal";
import { COMPANY } from "@/lib/company";
import { getLegalPage } from "@/lib/legalPages";

export const revalidate = 3600;

export const metadata: Metadata = {
    title: "Cookie Policy",
    description: `How ${COMPANY.name} uses cookies.`,
    alternates: { canonical: "/cookies" },
};

export default async function CookiesPage() {
    const page = await getLegalPage("cookies");
    return <LegalPageView page={page} title="Cookie Policy" homeHref="/" dateLocale="en-GB" />;
}
