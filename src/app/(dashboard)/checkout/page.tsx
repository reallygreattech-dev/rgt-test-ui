'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCartStore, useToastStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';

const checkoutSchema = z.object({
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zip: z.string().min(4, 'ZIP code is required'),
  country: z.string().min(2, 'Country is required'),
  paymentMethod: z.enum(['credit_card', 'paypal', 'bank_transfer']),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const { addToast } = useToastStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      country: 'US',
      paymentMethod: 'credit_card',
    },
  });

  if (items.length === 0 && !success) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">Your cart is empty</p>
        <Link href="/products">
          <Button data-testid="shop-now">Shop Now</Button>
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div
        className="flex flex-col items-center justify-center py-24"
        data-testid="checkout-success"
      >
        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
        <p className="text-gray-500 mb-2">Thank you for your purchase.</p>
        <p className="text-sm text-gray-400 mb-6">Order ID: #{orderId}</p>
        <div className="flex gap-3">
          <Link href={`/orders/${orderId}`}>
            <Button data-testid="view-order-link">View Order</Button>
          </Link>
          <Link href="/products">
            <Button variant="secondary" data-testid="continue-shopping">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = totalPrice();
  const shipping = 9.99;
  const total = subtotal + shipping;

  async function onSubmit(data: CheckoutForm) {
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            productName: i.productName,
            price: i.price,
            quantity: i.quantity,
          })),
          shippingAddress: {
            street: data.street,
            city: data.city,
            state: data.state,
            zip: data.zip,
            country: data.country,
          },
          paymentMethod: data.paymentMethod.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        addToast(json.error || 'Order failed', 'error');
        return;
      }

      clearCart();
      setOrderId(json.order.id);
      setSuccess(true);
    } catch {
      addToast('Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl" data-testid="checkout-page">
      <div className="flex items-center gap-3">
        <Link href="/cart">
          <Button variant="ghost" size="sm" data-testid="back-to-cart">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Cart
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} data-testid="checkout-form">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Checkout form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping address */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <Input
                  label="Street Address"
                  placeholder="123 Main Street"
                  data-testid="shipping-street"
                  error={errors.street?.message}
                  {...register('street')}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    placeholder="New York"
                    data-testid="shipping-city"
                    error={errors.city?.message}
                    {...register('city')}
                  />
                  <Input
                    label="State"
                    placeholder="NY"
                    data-testid="shipping-state"
                    error={errors.state?.message}
                    {...register('state')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="ZIP Code"
                    placeholder="10001"
                    data-testid="shipping-zip"
                    error={errors.zip?.message}
                    {...register('zip')}
                  />
                  <Input
                    label="Country"
                    placeholder="US"
                    data-testid="shipping-country"
                    error={errors.country?.message}
                    {...register('country')}
                  />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-xl shadow-sm p-6" data-testid="payment-section">
              <h2 className="font-semibold text-gray-900 mb-4">Payment Method</h2>
              <div className="space-y-3">
                {[
                  { value: 'credit_card', label: 'Credit Card', desc: 'Visa, Mastercard, Amex' },
                  { value: 'paypal', label: 'PayPal', desc: 'Pay with your PayPal account' },
                  { value: 'bank_transfer', label: 'Bank Transfer', desc: 'Direct bank transfer' },
                ].map((method) => (
                  <label
                    key={method.value}
                    className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    data-testid={`payment-option-${method.value}`}
                  >
                    <input
                      type="radio"
                      value={method.value}
                      {...register('paymentMethod')}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{method.label}</p>
                      <p className="text-sm text-gray-500">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order review */}
          <div>
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6" data-testid="order-review">
              <h2 className="font-semibold text-gray-900 mb-4">Order Review</h2>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.productName} x{item.quantity}
                    </span>
                    <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span>{formatCurrency(shipping)}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t">
                  <span>Total</span>
                  <span data-testid="checkout-total">{formatCurrency(total)}</span>
                </div>
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full mt-6"
                size="lg"
                data-testid="place-order-button"
              >
                Place Order
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
