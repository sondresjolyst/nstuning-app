"use client";

import Link from 'next/link';
import { ChartBarIcon, Cog6ToothIcon, Squares2X2Icon } from '@heroicons/react/24/outline';

const cards = [
    { href: '/admin/content', icon: Squares2X2Icon, title: 'Content', text: 'Build the home page from orderable sections — hero, features, text and more.' },
    { href: '/admin/dyno-runs', icon: ChartBarIcon, title: 'Dyno runs', text: 'Create, edit and publish dyno runs and upload PDF reports.' },
    { href: '/admin/settings', icon: Cog6ToothIcon, title: 'Settings', text: 'Manage site settings, including the contact enquiry recipient.' },
];

export default function AdminOverview() {
    return (
        <div className="grid sm:grid-cols-2 gap-6">
            {cards.map(card => (
                <Link key={card.href} href={card.href} className="rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition">
                    <card.icon className="h-8 w-8 text-gray-900" />
                    <h2 className="mt-4 font-bold text-gray-900">{card.title}</h2>
                    <p className="mt-1 text-sm text-gray-600">{card.text}</p>
                </Link>
            ))}
        </div>
    );
}
