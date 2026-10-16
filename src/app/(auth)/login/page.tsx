"use client";

import { LoginPage } from '@sjolystinnovation/app-kit/session/react';

export default function Login() {
    return <LoginPage redirectTo="/" resetHref="/reset-password" registerHref="/register" />;
}
