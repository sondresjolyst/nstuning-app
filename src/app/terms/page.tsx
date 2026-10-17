import type { Metadata } from "next";
import { LegalPageView } from "@sjolystinnovation/app-kit/legal";
import { COMPANY } from "@/lib/company";
import { getLegalPage } from "@/lib/legalPages";

export const revalidate = 3600;

export const metadata: Metadata = {
    title: "Terms of Service",
    description: `Terms of Service for ${COMPANY.name} (${COMPANY.legalName}).`,
    alternates: { canonical: "/terms" },
};

export default async function TermsPage() {
    const page = await getLegalPage("terms");
    return <LegalPageView page={page} title="Terms of Service" homeHref="/" dateLocale="en-GB" />;
}
