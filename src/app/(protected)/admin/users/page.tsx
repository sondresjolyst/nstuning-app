"use client";

import { AdminUsersPanel } from '@sjolystinnovation/app-kit/admin';
import AdminService from '@/services/adminService';

export default function AdminUsersPage() {
    return <AdminUsersPanel service={AdminService} getRoles={AdminService.getRoles} />;
}
