"use client";

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import AdminService, { AdminUser } from '@/services/adminService';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [allRoles, setAllRoles] = useState<string[]>([]);
    const [includeDeleted, setIncludeDeleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [addRoleFor, setAddRoleFor] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState('');
    const [roleLoading, setRoleLoading] = useState(false);

    const load = (deleted: boolean) => {
        setLoading(true);
        AdminService.getUsers(deleted)
            .then(setUsers)
            .catch(err => toast.error(err instanceof Error ? err.message : 'Failed to load users'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(includeDeleted); }, [includeDeleted]);
    useEffect(() => { AdminService.getRoles().then(setAllRoles).catch(() => toast.error('Failed to load roles')); }, []);

    const setRoles = (id: string, roles: string[]) =>
        setUsers(prev => prev.map(u => (u.id === id ? { ...u, roles } : u)));

    const assignRole = async (user: AdminUser) => {
        if (!selectedRole) return;
        setRoleLoading(true);
        try {
            await AdminService.addRole(user.id, selectedRole);
            setRoles(user.id, [...user.roles, selectedRole]);
            toast.success(`Added ${selectedRole} to ${user.firstName}`);
            setAddRoleFor(null);
            setSelectedRole('');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to assign role');
        } finally {
            setRoleLoading(false);
        }
    };

    const removeRole = async (user: AdminUser, role: string) => {
        try {
            await AdminService.removeRole(user.id, role);
            setRoles(user.id, user.roles.filter(r => r !== role));
            toast.success(`Removed ${role} from ${user.firstName}`);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to remove role');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-900">Users</h2>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" checked={includeDeleted} onChange={e => setIncludeDeleted(e.target.checked)} />
                    Show deleted
                </label>
            </div>

            {loading ? (
                <p className="text-gray-500">Loading…</p>
            ) : (
                <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200">
                    {users.map(user => {
                        const isAddingRole = addRoleFor === user.id;
                        const available = allRoles.filter(r => !user.roles.includes(r));
                        return (
                            <li key={user.id} className="p-4 space-y-2">
                                <div className={user.isDeleted ? 'text-gray-400' : 'text-gray-800'}>
                                    <span className="font-medium">{user.firstName} {user.lastName}</span>
                                    <span className="ml-2 text-xs text-gray-500">{user.email}</span>
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5">
                                    {user.roles.map(role => (
                                        <span key={role} className="flex items-center gap-1 pl-2 pr-1 py-0.5 bg-gray-100 border border-gray-200 rounded-lg text-xs text-gray-700">
                                            {role}
                                            <button onClick={() => removeRole(user, role)} className="hover:text-red-600 transition-colors" title={`Remove ${role}`}>
                                                <XMarkIcon className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                    {user.roles.length === 0 && <span className="text-xs text-gray-400">No roles</span>}
                                    {!isAddingRole && !user.isDeleted && available.length > 0 && (
                                        <button
                                            onClick={() => { setAddRoleFor(user.id); setSelectedRole(available[0]); }}
                                            className="flex items-center gap-1 px-2 py-0.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs text-gray-500 hover:text-gray-800 transition"
                                        >
                                            <PlusIcon className="h-3 w-3" /> Add role
                                        </button>
                                    )}
                                </div>

                                {isAddingRole && (
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={selectedRole}
                                            onChange={e => setSelectedRole(e.target.value)}
                                            className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
                                        >
                                            {available.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                        <button onClick={() => assignRole(user)} disabled={roleLoading} className="rounded-lg bg-gray-900 text-white text-xs px-3 py-1.5 hover:bg-gray-800 disabled:opacity-50 transition">
                                            {roleLoading ? '…' : 'Add'}
                                        </button>
                                        <button onClick={() => setAddRoleFor(null)} className="rounded-lg border border-gray-300 text-gray-700 text-xs px-3 py-1.5 hover:bg-gray-50 transition">
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
