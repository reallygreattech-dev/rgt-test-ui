'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, Users, Package, ClipboardList, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';

export default function AdminPage() {
  const { user } = useUserStore();
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') return;

    async function loadStats() {
      try {
        const [usersRes, productsRes, ordersRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/products?limit=100'),
          fetch('/api/orders?limit=100'),
        ]);

        const usersData = await usersRes.json();
        const productsData = await productsRes.json();
        const ordersData = await ordersRes.json();

        const revenue = (ordersData.orders || [])
          .filter((o: { status: string; total: number }) => o.status === 'delivered')
          .reduce((s: number, o: { total: number }) => s + o.total, 0);

        setStats({
          users: usersData.users?.length || 0,
          products: productsData.total || 0,
          orders: ordersData.total || 0,
          revenue,
        });
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [user]);

  if (user?.role !== 'admin') {
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

  const adminCards = [
    { label: 'Total Users', value: stats.users, icon: Users, href: '/admin/users', color: 'text-blue-600 bg-blue-100' },
    { label: 'Products', value: stats.products, icon: Package, href: '/products', color: 'text-purple-600 bg-purple-100' },
    { label: 'Orders', value: stats.orders, icon: ClipboardList, href: '/orders', color: 'text-green-600 bg-green-100' },
    { label: 'Revenue', value: formatCurrency(stats.revenue), icon: Shield, href: '/orders', color: 'text-orange-600 bg-orange-100' },
  ];

  return (
    <div className="space-y-6" data-testid="admin-page">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
          <p className="text-gray-500 mt-0.5">System administration and management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {adminCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              data-testid={`admin-card-${card.label.toLowerCase().replace(/\s+/g, '-')}`}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`inline-flex p-2 rounded-lg ${card.color} mb-3`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{loading ? '...' : card.value}</p>
              <p className="text-sm text-gray-500">{card.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Admin Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/users">
            <Button variant="secondary" data-testid="manage-users-button">
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
          </Link>
          <Link href="/products/new">
            <Button variant="secondary" data-testid="add-product-button">
              <Package className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
          <Link href="/orders">
            <Button variant="secondary" data-testid="view-orders-button">
              <ClipboardList className="h-4 w-4 mr-2" />
              View Orders
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
