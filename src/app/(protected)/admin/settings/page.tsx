"use client";

import { useEffect, useState } from 'react';
import { toast } from '@sjolystinnovation/app-kit/toast';
import { TextInput, Toggle } from '@sjolystinnovation/app-kit/ui';
import SettingsService, { Settings } from '@/services/settingsService';
import { BrandingManager } from '@sjolystinnovation/app-kit/branding';
import BrandingService from '@/services/brandingService';

const EMPTY: Settings = {
    contactRecipientEmail: '',
    companyName: '',
    companyLegalName: '',
    orgNumber: '',
    vatRegistered: false,
    streetAddress: '',
    postalCode: '',
    addressLocality: '',
    addressRegion: '',
    publicEmail: '',
    publicPhone: '',
};

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<Settings>(EMPTY);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        SettingsService.get()
            .then(setSettings)
            .catch(() => toast.error('Failed to load settings'))
            .finally(() => setLoading(false));
    }, []);

    const patch = (changes: Partial<Settings>) => setSettings(prev => ({ ...prev, ...changes }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            setSettings(await SettingsService.update(settings));
            toast.success('Settings saved');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p className="text-gray-500">Loading…</p>;

    return (
        <div className="space-y-8">
            <form onSubmit={handleSubmit} className="max-w-md space-y-4">
                <TextInput
                    label="Contact enquiry recipient"
                    name="contactRecipientEmail"
                    type="email"
                    value={settings.contactRecipientEmail}
                    onChange={e => patch({ contactRecipientEmail: e.target.value })}
                    required
                />
                <p className="text-xs text-gray-500">Contact form enquiries are emailed to this address.</p>

                <TextInput
                    label="Company name"
                    name="companyName"
                    value={settings.companyName}
                    onChange={e => patch({ companyName: e.target.value })}
                    required
                />
                <TextInput
                    label="Legal name"
                    name="companyLegalName"
                    value={settings.companyLegalName}
                    onChange={e => patch({ companyLegalName: e.target.value })}
                />
                <p className="text-xs text-gray-500">The registered name. Leave blank to use the company name.</p>

                <TextInput
                    label="Organisation number"
                    name="orgNumber"
                    value={settings.orgNumber}
                    onChange={e => patch({ orgNumber: e.target.value })}
                />
                <Toggle label="VAT (MVA) registered" checked={settings.vatRegistered} onChange={v => patch({ vatRegistered: v })} />
                <p className="text-xs text-gray-500">When on, the org number is shown with the “MVA” suffix.</p>

                <TextInput
                    label="Street address"
                    name="streetAddress"
                    value={settings.streetAddress}
                    onChange={e => patch({ streetAddress: e.target.value })}
                    required
                />
                <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
                    <TextInput
                        label="Postal code"
                        name="postalCode"
                        inputMode="numeric"
                        value={settings.postalCode}
                        onChange={e => patch({ postalCode: e.target.value })}
                    />
                    <TextInput
                        label="Place"
                        name="addressLocality"
                        value={settings.addressLocality}
                        onChange={e => patch({ addressLocality: e.target.value })}
                    />
                </div>
                <TextInput
                    label="County"
                    name="addressRegion"
                    value={settings.addressRegion}
                    onChange={e => patch({ addressRegion: e.target.value })}
                />
                <p className="text-xs text-gray-500">The county is optional.</p>
                <TextInput
                    label="Public email"
                    name="publicEmail"
                    type="email"
                    value={settings.publicEmail}
                    onChange={e => patch({ publicEmail: e.target.value })}
                    required
                />
                <TextInput
                    label="Public phone"
                    name="publicPhone"
                    value={settings.publicPhone}
                    onChange={e => patch({ publicPhone: e.target.value })}
                    required
                />

                <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-primary text-primary-foreground font-semibold px-5 py-2.5 hover:brightness-95 disabled:opacity-60 transition"
                >
                    {saving ? 'Saving…' : 'Save'}
                </button>
            </form>

            <BrandingManager save={BrandingService.update} />
        </div>
    );
}
