"use client";

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import TextInput from '@/components/TextInput';
import SettingsService from '@/services/settingsService';

export default function AdminSettingsPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        SettingsService.get()
            .then(s => setEmail(s.contactRecipientEmail))
            .catch(() => toast.error('Failed to load settings'))
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const updated = await SettingsService.update({ contactRecipientEmail: email });
            setEmail(updated.contactRecipientEmail);
            toast.success('Settings saved');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p className="text-gray-500">Loading…</p>;

    return (
        <form onSubmit={handleSubmit} className="max-w-md space-y-4">
            <TextInput
                label="Contact enquiry recipient"
                name="contactRecipientEmail"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
            />
            <p className="text-xs text-gray-500">Contact form enquiries are emailed to this address.</p>
            <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-primary text-primary-foreground font-semibold px-5 py-2.5 hover:brightness-95 disabled:opacity-60 transition"
            >
                {saving ? 'Saving…' : 'Save'}
            </button>
        </form>
    );
}
