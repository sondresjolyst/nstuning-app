import type { Metadata } from "next";
import { LegalPageView } from "@sjolystinnovation/app-kit/legal";
import { COMPANY } from "@/lib/company";
import { getLegalPage } from "@/lib/legalPages";

export const revalidate = 3600;

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: `How ${COMPANY.name} (${COMPANY.legalName}) collects, uses, and protects your personal data.`,
    alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
    const page = await getLegalPage("privacy");
    return <LegalPageView page={page} title="Privacy Policy" homeHref="/" dateLocale="en-GB" />;
}
