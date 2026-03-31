'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUserStore, useToastStore } from '@/lib/store';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  bio: z.string().optional(),
  avatarUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, setUser } = useUserStore();
  const { addToast } = useToastStore();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      bio: '',
      avatarUrl: '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  async function onProfileSubmit(data: ProfileForm) {
    if (!user) return;
    setSavingProfile(true);
    try {
      const res = await fetch(`/api/users/${user.sub}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, email: data.email, bio: data.bio, avatarUrl: data.avatarUrl }),
      });

      if (res.ok) {
        const json = await res.json();
        setUser({ ...user, name: json.user.name, email: json.user.email });
        addToast('Profile updated successfully', 'success');
      } else {
        addToast('Failed to update profile', 'error');
      }
    } catch {
      addToast('Something went wrong', 'error');
    } finally {
      setSavingProfile(false);
    }
  }

  async function onPasswordSubmit(data: PasswordForm) {
    setSavingPassword(true);
    try {
      // Simulate password check
      await new Promise((r) => setTimeout(r, 500));
      if (data.currentPassword !== 'password123') {
        addToast('Current password is incorrect', 'error');
        return;
      }
      addToast('Password changed successfully', 'success');
      resetPassword();
    } catch {
      addToast('Something went wrong', 'error');
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl" data-testid="profile-page">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500 mt-1">Manage your personal information</p>
      </div>

      {/* Profile info */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-lg" data-testid="profile-name">{user?.name}</p>
            <p className="text-gray-500" data-testid="profile-email">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full capitalize">
              {user?.role}
            </span>
          </div>
        </div>

        <form
          onSubmit={handleProfileSubmit(onProfileSubmit)}
          className="space-y-4"
          data-testid="profile-form"
        >
          <Input
            label="Full Name"
            data-testid="name-input"
            error={profileErrors.name?.message}
            {...registerProfile('name')}
          />
          <Input
            label="Email Address"
            type="email"
            data-testid="email-input"
            error={profileErrors.email?.message}
            {...registerProfile('email')}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Bio</label>
            <textarea
              rows={3}
              placeholder="Tell us about yourself..."
              data-testid="bio-input"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...registerProfile('bio')}
            />
          </div>
          <Input
            label="Avatar URL"
            type="url"
            placeholder="https://..."
            data-testid="avatar-url-input"
            error={profileErrors.avatarUrl?.message}
            {...registerProfile('avatarUrl')}
          />
          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" loading={savingProfile} data-testid="save-profile">
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Password change */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="font-semibold text-gray-900 mb-6">Change Password</h2>
        <form
          onSubmit={handlePasswordSubmit(onPasswordSubmit)}
          className="space-y-4"
          data-testid="password-form"
        >
          <Input
            label="Current Password"
            type="password"
            data-testid="current-password-input"
            error={passwordErrors.currentPassword?.message}
            {...registerPassword('currentPassword')}
          />
          <Input
            label="New Password"
            type="password"
            data-testid="new-password-input"
            error={passwordErrors.newPassword?.message}
            {...registerPassword('newPassword')}
          />
          <Input
            label="Confirm New Password"
            type="password"
            data-testid="confirm-password-input"
            error={passwordErrors.confirmPassword?.message}
            {...registerPassword('confirmPassword')}
          />
          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" loading={savingPassword} data-testid="change-password-button">
              Change Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
