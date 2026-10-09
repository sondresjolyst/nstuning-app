"use client";

import { ProtectedGate as Gate } from '@sjolystinnovation/app-kit/session/react';

export default function ProtectedGate({ children }: { children: React.ReactNode }) {
    return (
        <Gate loginHref="/login" fallback={<div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500">Loading…</div>}>
            {children}
        </Gate>
    );
}
