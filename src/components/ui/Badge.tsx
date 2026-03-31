import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default' | 'purple';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  'data-testid'?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-800 border border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  danger: 'bg-red-100 text-red-800 border border-red-200',
  info: 'bg-blue-100 text-blue-800 border border-blue-200',
  default: 'bg-gray-100 text-gray-800 border border-gray-200',
  purple: 'bg-purple-100 text-purple-800 border border-purple-200',
};

export function Badge({ variant = 'default', children, className, 'data-testid': testId }: BadgeProps) {
  return (
    <span
      data-testid={testId}
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function getOrderStatusBadge(status: string) {
  const map: Record<string, BadgeVariant> = {
    pending: 'warning',
    processing: 'info',
    shipped: 'purple',
    delivered: 'success',
    cancelled: 'danger',
  };
  return map[status] || 'default';
}

export function getStockBadge(stock: number): { label: string; variant: BadgeVariant } {
  if (stock === 0) return { label: 'Out of Stock', variant: 'danger' };
  if (stock <= 5) return { label: 'Low Stock', variant: 'warning' };
  return { label: 'In Stock', variant: 'success' };
}
