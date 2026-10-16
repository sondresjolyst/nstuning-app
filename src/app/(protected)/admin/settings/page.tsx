"use client";

import { CompanySettingsForm } from '@sjolystinnovation/app-kit/admin';
import { BrandingManager } from '@sjolystinnovation/app-kit/branding';
import SettingsService from '@/services/settingsService';
import BrandingService from '@/services/brandingService';

export default function AdminSettingsPage() {
    return (
        <CompanySettingsForm service={SettingsService}>
            <BrandingManager save={BrandingService.update} />
        </CompanySettingsForm>
    );
}
