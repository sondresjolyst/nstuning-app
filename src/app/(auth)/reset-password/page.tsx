"use client";
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import { ResetPasswordFlow } from '@sjolystinnovation/app-kit/ui';
import UserService from '@/services/userService';

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={null}>
            <ResetPassword />
        </Suspense>
    );
}

// The emailed link carries the email and code, so the flow opens on its last step.
function ResetPassword() {
    const params = useSearchParams();
    return (
        <ResetPasswordFlow
            requestReset={UserService.requestPasswordReset}
            reset={UserService.resetPassword}
            loginHref="/login"
            initialEmail={params.get('email') ?? ''}
            initialCode={params.get('code') ?? ''}
        />
    );
}
