'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ShoppingCart, ClipboardList, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge, getOrderStatusBadge } from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Order } from '@/lib/types';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          fetch('/api/orders?limit=5'),
          fetch('/api/products?limit=100'),
        ]);

        const ordersData = await ordersRes.json();
        const productsData = await productsRes.json();

        setOrders(ordersData.orders || []);

        const totalRevenue = (ordersData.orders || [])
          .filter((o: Order) => o.status === 'delivered')
          .reduce((sum: number, o: Order) => sum + o.total, 0);

        setStats({
          totalProducts: productsData.total || 0,
          totalOrders: ordersData.total || 0,
          totalRevenue,
          totalUsers: 5,
        });
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const statCards = [
    {
      label: 'Total Products',
      value: stats?.totalProducts ?? 0,
      icon: Package,
      color: 'text-blue-600 bg-blue-100',
      href: '/products',
    },
    {
      label: 'Total Orders',
      value: stats?.totalOrders ?? 0,
      icon: ClipboardList,
      color: 'text-purple-600 bg-purple-100',
      href: '/orders',
    },
    {
      label: 'Revenue',
      value: formatCurrency(stats?.totalRevenue ?? 0),
      icon: TrendingUp,
      color: 'text-green-600 bg-green-100',
      href: '/orders',
    },
    {
      label: 'Users',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: 'text-orange-600 bg-orange-100',
      href: '/admin/users',
    },
  ];

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          : statCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.label}
                  href={card.href}
                  data-testid={`stat-card-${card.label.toLowerCase().replace(/\s+/g, '-')}`}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg ${card.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{card.label}</p>
                </Link>
              );
            })}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/products/new">
            <Button variant="primary" data-testid="quick-action-new-product">
              <Package className="h-4 w-4 mr-2" />
              New Product
            </Button>
          </Link>
          <Link href="/orders">
            <Button variant="secondary" data-testid="quick-action-view-orders">
              <ClipboardList className="h-4 w-4 mr-2" />
              View Orders
            </Button>
          </Link>
          <Link href="/cart">
            <Button variant="ghost" data-testid="quick-action-view-cart">
              <ShoppingCart className="h-4 w-4 mr-2" />
              View Cart
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <Link href="/orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-3" data-testid="loading-skeleton">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No orders found</td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      key={order.id}
                      data-testid={`row-${order.id}`}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link href={`/orders/${order.id}`} className="text-blue-600 hover:text-blue-700 font-medium">
                          #{order.id}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{formatDate(order.createdAt)}</td>
                      <td className="px-6 py-4 text-gray-700">{order.items.length} item(s)</td>
                      <td className="px-6 py-4 font-medium">{formatCurrency(order.total)}</td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={getOrderStatusBadge(order.status)}
                          data-testid={`badge-${order.status}`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
