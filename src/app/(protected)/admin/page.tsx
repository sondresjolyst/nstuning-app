"use client";

import Link from 'next/link';
import { ChartBarIcon, Cog6ToothIcon, Squares2X2Icon, PresentationChartLineIcon, UsersIcon } from '@heroicons/react/24/outline';

const cards = [
    { href: '/admin/content', icon: Squares2X2Icon, title: 'Content', text: 'Build the home page from orderable sections.' },
    { href: '/admin/dyno-runs', icon: ChartBarIcon, title: 'Dyno runs', text: 'Create, edit and publish dyno runs.' },
    { href: '/admin/stats', icon: PresentationChartLineIcon, title: 'Stats', text: 'Site totals, trends, storage and email.' },
    { href: '/admin/users', icon: UsersIcon, title: 'Users', text: 'Manage users and assign roles.' },
    { href: '/admin/settings', icon: Cog6ToothIcon, title: 'Settings', text: 'Manage site settings.' },
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
