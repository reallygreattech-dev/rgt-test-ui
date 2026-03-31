'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ClipboardList,
  User,
  Settings,
  Shield,
  Users,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/lib/store';
import { JWTPayload } from '@/lib/types';

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  testId: string;
  badge?: () => number;
  children?: { label: string; href: string; testId: string }[];
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    testId: 'nav-dashboard',
  },
  {
    label: 'Products',
    icon: Package,
    testId: 'nav-products',
    children: [
      { label: 'All Products', href: '/products', testId: 'nav-products-list' },
      { label: 'Add Product', href: '/products/new', testId: 'nav-products-new' },
    ],
  },
  {
    label: 'Cart',
    href: '/cart',
    icon: ShoppingCart,
    testId: 'nav-cart',
    badge: () => 0,
  },
  {
    label: 'Orders',
    href: '/orders',
    icon: ClipboardList,
    testId: 'nav-orders',
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: User,
    testId: 'nav-profile',
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    testId: 'nav-settings',
  },
  {
    label: 'Admin',
    icon: Shield,
    testId: 'nav-admin',
    adminOnly: true,
    children: [
      { label: 'Overview', href: '/admin', testId: 'nav-admin-overview' },
      { label: 'Users', href: '/admin/users', testId: 'nav-admin-users' },
    ],
  },
];

interface SidebarProps {
  user: JWTPayload | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['Products', 'Admin']);
  const cartItems = useCartStore((state) => state.totalItems());

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity',
          collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
        )}
        onClick={() => setCollapsed(true)}
      />

      <aside
        data-testid="sidebar"
        className={cn(
          'fixed left-0 top-0 h-full bg-[#1e293b] text-white z-30 flex flex-col transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          {!collapsed && (
            <span className="font-bold text-lg text-white">RGT Shop</span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            data-testid="sidebar-toggle"
            className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors ml-auto"
          >
            {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
          {navItems
            .filter((item) => !item.adminOnly || user?.role === 'admin')
            .map((item) => {
              const Icon = item.icon;
              const badge = item.label === 'Cart' ? cartItems : 0;

              if (item.children) {
                const isExpanded = expandedItems.includes(item.label);
                const anyChildActive = item.children.some((c) => isActive(c.href));

                return (
                  <div key={item.label}>
                    <button
                      onClick={() => !collapsed && toggleExpanded(item.label)}
                      data-testid={item.testId}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left',
                        anyChildActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                      )}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-sm font-medium">{item.label}</span>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </>
                      )}
                    </button>
                    {!collapsed && isExpanded && (
                      <div className="ml-8 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            data-testid={child.testId}
                            className={cn(
                              'block px-3 py-1.5 rounded-lg text-sm transition-colors',
                              isActive(child.href)
                                ? 'text-white font-medium'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700'
                            )}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href!}
                  data-testid={item.testId}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative',
                    isActive(item.href!)
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                  {badge > 0 && (
                    <span
                      data-testid="cart-badge"
                      className={cn(
                        'bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold',
                        collapsed ? 'absolute top-1 right-1 w-4 h-4' : 'ml-auto w-5 h-5'
                      )}
                    >
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
        </nav>

        {/* User info */}
        {!collapsed && user && (
          <div className="p-4 border-t border-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
