'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { ToastContainer } from '@/components/ui/Toast';
import { useUserStore } from '@/lib/store';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, setUser, setLoading, isLoading } = useUserStore();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const json = await res.json();
        setUser({
          sub: json.user.id || json.user.sub,
          email: json.user.email,
          name: json.user.name,
          role: json.user.role,
        });
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    if (!user) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" data-testid="loading-skeleton" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col md:ml-64">
        <Topbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
      <ToastContainer />
    </div>
  );
}
