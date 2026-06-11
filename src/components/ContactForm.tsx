"use client";

import { useState } from 'react';
import { toast } from 'sonner';
import TextInput from './TextInput';
import ContactService from '@/services/contactService';
import { contactSchema, ContactInput } from '@/lib/validation';

const empty: ContactInput = { name: '', email: '', phone: '', car: '', message: '' };

export default function ContactForm() {
    const [form, setForm] = useState<ContactInput>(empty);
    const [errors, setErrors] = useState<Partial<Record<keyof ContactInput, string>>>({});
    const [submitting, setSubmitting] = useState(false);

    const update = (field: keyof ContactInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm(f => ({ ...f, [field]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const parsed = contactSchema.safeParse(form);
        if (!parsed.success) {
            const fieldErrors: Partial<Record<keyof ContactInput, string>> = {};
            for (const issue of parsed.error.issues) {
                const key = issue.path[0] as keyof ContactInput;
                fieldErrors[key] ??= issue.message;
            }
            setErrors(fieldErrors);
            return;
        }
        setErrors({});
        setSubmitting(true);
        try {
            await ContactService.send(parsed.data);
            toast.success("Thanks — we'll be in touch.");
            setForm(empty);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to send message');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
                <TextInput label="Name" name="name" value={form.name} onChange={update('name')} error={errors.name} />
                <TextInput label="Email" name="email" type="email" value={form.email} onChange={update('email')} error={errors.email} />
                <TextInput label="Phone" name="phone" value={form.phone ?? ''} onChange={update('phone')} error={errors.phone} />
                <TextInput label="Car" name="car" value={form.car ?? ''} onChange={update('car')} error={errors.car} placeholder="e.g. VW Golf R" />
            </div>
            <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={form.message}
                    onChange={update('message')}
                    className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary ${errors.message ? 'border-red-400' : 'border-gray-300'}`}
                />
                {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
            </div>
            <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-primary text-primary-foreground font-semibold px-5 py-2.5 hover:brightness-95 disabled:opacity-60 transition"
            >
                {submitting ? 'Sending…' : 'Send enquiry'}
            </button>
        </form>
    );
}
