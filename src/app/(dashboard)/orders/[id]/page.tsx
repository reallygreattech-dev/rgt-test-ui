'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Clock, Truck, XCircle, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge, getOrderStatusBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { Order, OrderStatus } from '@/lib/types';

const statusIcons: Record<OrderStatus, React.ElementType> = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (!res.ok) {
          router.push('/orders');
          return;
        }
        const data = await res.json();
        setOrder(data.order);
      } catch {
        router.push('/orders');
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [id, router]);

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl" data-testid="loading-skeleton">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="space-y-6 max-w-4xl" data-testid="order-detail-page">
      <div className="flex items-center gap-3">
        <Link href="/orders">
          <Button variant="ghost" size="sm" data-testid="back-button">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <div className="flex-1 flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
          <Badge
            variant={getOrderStatusBadge(order.status)}
            data-testid={`badge-${order.status}`}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-900">Order Items</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Qty</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={i} className="border-b" data-testid={`order-item-${item.productId}`}>
                    <td className="px-4 py-3 font-medium text-gray-900">{item.productName}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(item.price)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{item.quantity}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td colSpan={3} className="px-4 py-3 text-right font-bold text-gray-900">Total</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900" data-testid="order-total">
                    {formatCurrency(order.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Status timeline */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-6">Status Timeline</h2>
            <div className="space-y-4" data-testid="status-timeline">
              {order.statusHistory.map((event, i) => {
                const Icon = statusIcons[event.status];
                return (
                  <div key={i} className="flex gap-4" data-testid={`timeline-${event.status}`}>
                    <div className="flex flex-col items-center">
                      <div className={`p-2 rounded-full ${i === order.statusHistory.length - 1 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      {i < order.statusHistory.length - 1 && (
                        <div className="w-0.5 h-6 bg-gray-200 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium text-gray-900 capitalize">{event.status}</p>
                      {event.note && <p className="text-sm text-gray-500">{event.note}</p>}
                      <p className="text-xs text-gray-400 mt-1">{formatDateTime(event.timestamp)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Order Date</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment</span>
                <span>{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping address */}
          <div className="bg-white rounded-xl shadow-sm p-6" data-testid="shipping-info">
            <h2 className="font-semibold text-gray-900 mb-4">Shipping Address</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
