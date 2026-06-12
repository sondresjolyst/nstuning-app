"use client";

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';
import TextInput from '@/components/TextInput';
import UserService, { UserProfile } from '@/services/userService';

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [saving, setSaving] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        UserService.getProfile()
            .then(p => {
                setProfile(p);
                setFirstName(p.firstName);
                setLastName(p.lastName);
            })
            .catch(err => toast.error(err instanceof Error ? err.message : 'Failed to load profile'));
    }, []);

    const dirty = profile != null && (firstName !== profile.firstName || lastName !== profile.lastName);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!firstName.trim() || !lastName.trim()) {
            toast.error('First and last name are required.');
            return;
        }
        setSaving(true);
        try {
            const updated = await UserService.updateProfile({ firstName: firstName.trim(), lastName: lastName.trim() });
            setProfile(updated);
            toast.success('Profile updated.');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    }

    async function handleExport() {
        setExporting(true);
        try {
            const data = await UserService.exportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'nstuning-data.json';
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to export data');
        } finally {
            setExporting(false);
        }
    }

    async function handleDelete() {
        setDeleting(true);
        try {
            await UserService.deleteAccount();
            toast.success('Account deleted.');
            await signOut({ callbackUrl: '/' });
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete account');
            setDeleting(false);
        }
    }

    if (!profile) {
        return <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-500">Loading…</div>;
    }

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 space-y-8">
            <h1 className="text-3xl font-black text-gray-900">Your account</h1>

            <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="text-base font-semibold text-gray-900">Profile</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                    <TextInput label="First name" name="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                    <TextInput label="Last name" name="lastName" value={lastName} onChange={e => setLastName(e.target.value)} required />
                </div>
                <TextInput label="Username" name="userName" value={profile.userName} disabled />
                <TextInput label="Email" name="email" value={profile.email} disabled />
                <button
                    type="submit"
                    disabled={!dirty || saving}
                    className="rounded-lg bg-primary text-primary-foreground font-semibold px-5 py-2.5 hover:brightness-95 disabled:opacity-60 transition"
                >
                    {saving ? 'Saving…' : 'Save changes'}
                </button>
            </form>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-3">
                <h2 className="text-base font-semibold text-gray-900">Your data</h2>
                <p className="text-sm text-gray-600">Download a copy of all the personal data we hold about you, in JSON format.</p>
                <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="rounded-lg border border-gray-300 text-gray-900 font-medium px-5 py-2.5 hover:bg-gray-50 disabled:opacity-60 transition"
                >
                    {exporting ? 'Preparing…' : 'Export my data'}
                </button>
            </div>

            <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-sm space-y-3">
                <h2 className="text-base font-semibold text-red-700">Delete account</h2>
                <p className="text-sm text-gray-600">This permanently deletes your account and scrubs your personal data. This cannot be undone.</p>
                {!confirmDelete ? (
                    <button
                        onClick={() => setConfirmDelete(true)}
                        className="rounded-lg border border-red-300 text-red-700 font-medium px-5 py-2.5 hover:bg-red-50 transition"
                    >
                        Delete my account
                    </button>
                ) : (
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm text-gray-700">Are you sure?</span>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="rounded-lg bg-red-600 text-white font-semibold px-5 py-2.5 hover:bg-red-700 disabled:opacity-60 transition"
                        >
                            {deleting ? 'Deleting…' : 'Yes, delete'}
                        </button>
                        <button
                            onClick={() => setConfirmDelete(false)}
                            disabled={deleting}
                            className="rounded-lg border border-gray-300 text-gray-900 font-medium px-5 py-2.5 hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
