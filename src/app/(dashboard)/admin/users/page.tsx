'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Search, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { useUserStore, useToastStore } from '@/lib/store';
import { User, UserRole } from '@/lib/types';

export default function AdminUsersPage() {
  const { user: currentUser } = useUserStore();
  const { addToast } = useToastStore();
  const [users, setUsers] = useState<Omit<User, 'password'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState<Omit<User, 'password'> | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('user');
  const [savingRole, setSavingRole] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(search ? { search } : {});
      const res = await fetch(`/api/users?${params}`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      loadUsers();
    } else {
      setLoading(false);
    }
  }, [loadUsers, currentUser]);

  async function handleToggleStatus(userId: string, currentStatus: string) {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: newStatus as 'active' | 'disabled' } : u))
        );
        addToast(`User ${newStatus === 'active' ? 'enabled' : 'disabled'}`, 'success');
      }
    } catch {
      addToast('Failed to update user status', 'error');
    }
  }

  async function handleSaveRole() {
    if (!editUser) return;
    setSavingRole(true);
    try {
      const res = await fetch(`/api/users/${editUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u.id === editUser.id ? { ...u, role: newRole } : u)));
        addToast('User role updated', 'success');
        setEditUser(null);
      } else {
        addToast('Failed to update role', 'error');
      }
    } catch {
      addToast('Something went wrong', 'error');
    } finally {
      setSavingRole(false);
    }
  }

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-24" data-testid="forbidden-page">
        <AlertTriangle className="h-16 w-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">403 - Access Forbidden</h2>
        <p className="text-gray-500 mb-6">You don&apos;t have permission to access this area.</p>
        <Link href="/dashboard">
          <Button data-testid="back-to-dashboard">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-users-page">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 mt-1">Manage user accounts and roles</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="user-search"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-3" data-testid="loading-skeleton">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No users found</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr
                      key={u.id}
                      data-testid={`row-${u.id}`}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{u.name}</p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={u.role === 'admin' ? 'purple' : 'default'}
                          data-testid={`badge-role-${u.id}`}
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={u.status === 'active' ? 'success' : 'danger'}
                          data-testid={`badge-status-${u.id}`}
                        >
                          {u.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditUser(u);
                              setNewRole(u.role);
                            }}
                            data-testid={`edit-role-${u.id}`}
                          >
                            Edit Role
                          </Button>
                          <Button
                            variant={u.status === 'active' ? 'danger' : 'secondary'}
                            size="sm"
                            onClick={() => handleToggleStatus(u.id, u.status)}
                            data-testid={`toggle-status-${u.id}`}
                          >
                            {u.status === 'active' ? 'Disable' : 'Enable'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Role Modal */}
      <Modal
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        title="Edit User Role"
        size="sm"
      >
        {editUser && (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900">{editUser.name}</p>
              <p className="text-sm text-gray-500">{editUser.email}</p>
            </div>
            <Select
              label="Role"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as UserRole)}
              data-testid="role-select"
              options={[
                { value: 'user', label: 'User' },
                { value: 'admin', label: 'Admin' },
              ]}
            />
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => setEditUser(null)}
                data-testid="cancel-role-edit"
              >
                Cancel
              </Button>
              <Button
                loading={savingRole}
                onClick={handleSaveRole}
                data-testid="save-role"
              >
                Save
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
