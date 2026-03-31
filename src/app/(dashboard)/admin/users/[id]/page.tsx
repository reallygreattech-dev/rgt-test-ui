'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { useUserStore, useToastStore } from '@/lib/store';
import { User, UserRole } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function AdminUserDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user: currentUser } = useUserStore();
  const { addToast } = useToastStore();
  const [targetUser, setTargetUser] = useState<Omit<User, 'password'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [editRole, setEditRole] = useState<UserRole>('user');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      setLoading(false);
      return;
    }

    async function loadUser() {
      try {
        const res = await fetch(`/api/users/${id}`);
        if (!res.ok) {
          router.push('/admin/users');
          return;
        }
        const data = await res.json();
        setTargetUser(data.user);
        setEditRole(data.user.role);
      } catch {
        router.push('/admin/users');
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [id, router, currentUser]);

  async function handleSave() {
    if (!targetUser) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: editRole }),
      });

      if (res.ok) {
        const data = await res.json();
        setTargetUser(data.user);
        addToast('User role updated', 'success');
      } else {
        addToast('Failed to update role', 'error');
      }
    } catch {
      addToast('Something went wrong', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-24" data-testid="forbidden-page">
        <AlertTriangle className="h-16 w-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">403 - Access Forbidden</h2>
        <Link href="/dashboard">
          <Button data-testid="back-to-dashboard">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl" data-testid="loading-skeleton">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!targetUser) return null;

  return (
    <div className="space-y-6 max-w-2xl" data-testid="admin-user-detail-page">
      <div className="flex items-center gap-3">
        <Link href="/admin/users">
          <Button variant="ghost" size="sm" data-testid="back-button">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">User Detail</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
            {targetUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900" data-testid="user-name">{targetUser.name}</h2>
            <p className="text-gray-500" data-testid="user-email">{targetUser.email}</p>
            <div className="flex gap-2 mt-1">
              <Badge
                variant={targetUser.role === 'admin' ? 'purple' : 'default'}
                data-testid="user-role-badge"
              >
                {targetUser.role}
              </Badge>
              <Badge
                variant={targetUser.status === 'active' ? 'success' : 'danger'}
                data-testid="user-status-badge"
              >
                {targetUser.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-gray-500">User ID</p>
            <p className="font-medium">{targetUser.id}</p>
          </div>
          <div>
            <p className="text-gray-500">Joined</p>
            <p className="font-medium">{formatDate(targetUser.createdAt)}</p>
          </div>
          {targetUser.bio && (
            <div className="col-span-2">
              <p className="text-gray-500">Bio</p>
              <p className="font-medium">{targetUser.bio}</p>
            </div>
          )}
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-900 mb-4">Edit Role</h3>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Select
                label="Role"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as UserRole)}
                data-testid="role-select"
                options={[
                  { value: 'user', label: 'User' },
                  { value: 'admin', label: 'Admin' },
                ]}
              />
            </div>
            <Button
              loading={saving}
              onClick={handleSave}
              data-testid="save-role-button"
            >
              Save Role
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
