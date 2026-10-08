"use client";

import { toast } from 'sonner';
import { SessionExpiryGuard as Guard } from '@sjolystinnovation/app-kit/session/react';

export default function SessionExpiryGuard() {
    return <Guard loginHref="/login" onRestored={() => toast.success('You are signed in again. Try saving again.')} />;
}
