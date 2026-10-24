import { createSettingsService, type SiteSettings } from '@sjolystinnovation/app-kit/api';
import axiosInstance from './axiosInstance';
import { REVALIDATE_TARGETS, revalidateTarget } from '@/lib/cacheTags';

export type Settings = SiteSettings;

// The company details live in the settings, so a save refreshes every page that shows them.
const SettingsService = createSettingsService(axiosInstance, {
    onSaved: () => revalidateTarget(REVALIDATE_TARGETS.company),
});

export default SettingsService;
