'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import Link from 'next/link';
import { useUserStore } from '@/lib/store';
import { cn } from '@/lib/utils';

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs = [{ label: 'Home', href: '/dashboard' }];

  let path = '';
  for (const segment of segments) {
    path += `/${segment}`;
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    crumbs.push({ label, href: path });
  }

  return crumbs;
}

export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUserStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const breadcrumbs = getBreadcrumbs(pathname);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  const notifications = [
    { id: '1', message: 'New order #order-20 received', time: '5m ago', unread: true },
    { id: '2', message: 'Product "Yoga Mat" is low on stock', time: '1h ago', unread: true },
    { id: '3', message: 'User alice@test.com was disabled', time: '2h ago', unread: false },
  ];

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm h-16 flex items-center px-6 gap-4" data-testid="topbar">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm flex-1" data-testid="breadcrumb">
        {breadcrumbs.map((crumb, i) => (
          <React.Fragment key={crumb.href}>
            {i > 0 && <span className="text-gray-400">/</span>}
            {i === breadcrumbs.length - 1 ? (
              <span className="font-medium text-gray-900">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="text-gray-500 hover:text-gray-700 transition-colors">
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => {
            setNotifOpen(!notifOpen);
            setMenuOpen(false);
          }}
          data-testid="notifications-bell"
          className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {notifOpen && (
          <div
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50"
            data-testid="notifications-dropdown"
          >
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
            </div>
            <div className="divide-y">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn('p-4 hover:bg-gray-50', n.unread && 'bg-blue-50/50')}
                  data-testid={`notification-${n.id}`}
                >
                  <p className="text-sm text-gray-700">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => {
            setMenuOpen(!menuOpen);
            setNotifOpen(false);
          }}
          data-testid="user-menu-trigger"
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>

        {menuOpen && (
          <div
            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50"
            data-testid="user-menu-dropdown"
          >
            <div className="p-2">
              <Link
                href="/profile"
                data-testid="user-menu-profile"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
              <Link
                href="/settings"
                data-testid="user-menu-settings"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <hr className="my-1" />
              <button
                onClick={handleLogout}
                data-testid="logout-button"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
