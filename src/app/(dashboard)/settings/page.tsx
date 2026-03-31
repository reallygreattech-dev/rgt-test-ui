'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useToastStore } from '@/lib/store';

interface Settings {
  emailNotifications: boolean;
  orderUpdates: boolean;
  marketingEmails: boolean;
  smsNotifications: boolean;
  theme: string;
  language: string;
}

export default function SettingsPage() {
  const { addToast } = useToastStore();
  const [settings, setSettings] = useState<Settings>({
    emailNotifications: true,
    orderUpdates: true,
    marketingEmails: false,
    smsNotifications: false,
    theme: 'light',
    language: 'en',
  });
  const [saving, setSaving] = useState(false);

  function toggle(key: keyof Settings) {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    addToast('Settings saved successfully', 'success');
    setSaving(false);
  }

  const toggleItems = [
    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive email notifications for account activity' },
    { key: 'orderUpdates', label: 'Order Updates', desc: 'Get notified when your order status changes' },
    { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Receive promotional offers and newsletters' },
    { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Get text message alerts for important updates' },
  ];

  return (
    <div className="space-y-6 max-w-2xl" data-testid="settings-page">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your app preferences</p>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="font-semibold text-gray-900 mb-6">Notifications</h2>
        <div className="space-y-5">
          {toggleItems.map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
              <button
                role="switch"
                aria-checked={settings[item.key as keyof Settings] as boolean}
                onClick={() => toggle(item.key as keyof Settings)}
                data-testid={`toggle-${item.key}`}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  settings[item.key as keyof Settings] ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    settings[item.key as keyof Settings] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="font-semibold text-gray-900 mb-6">Appearance &amp; Language</h2>
        <div className="space-y-4">
          <Select
            label="Theme"
            data-testid="theme-select"
            value={settings.theme}
            onChange={(e) => setSettings((prev) => ({ ...prev, theme: e.target.value }))}
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'System' },
            ]}
          />
          <Select
            label="Language"
            data-testid="language-select"
            value={settings.language}
            onChange={(e) => setSettings((prev) => ({ ...prev, language: e.target.value }))}
            options={[
              { value: 'en', label: 'English' },
              { value: 'es', label: 'Spanish' },
              { value: 'fr', label: 'French' },
              { value: 'de', label: 'German' },
              { value: 'ja', label: 'Japanese' },
            ]}
          />
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-xl shadow-sm p-8 border border-red-100">
        <h2 className="font-semibold text-red-600 mb-4">Danger Zone</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Delete Account</p>
            <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
          </div>
          <Button
            variant="danger"
            size="sm"
            data-testid="delete-account-button"
            onClick={() => addToast('Account deletion is disabled in demo mode', 'info')}
          >
            Delete Account
          </Button>
        </div>
      </div>

      <div className="flex justify-end">
        <Button loading={saving} onClick={handleSave} data-testid="save-settings">
          Save Settings
        </Button>
      </div>
    </div>
  );
}
