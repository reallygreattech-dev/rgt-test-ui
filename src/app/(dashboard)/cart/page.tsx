'use client';

import React from 'react';
import Link from 'next/link';
import { Trash2, ShoppingBag, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24" data-testid="empty-cart">
        <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some products to get started</p>
        <Link href="/products">
          <Button data-testid="continue-shopping">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  const subtotal = totalPrice();
  const shipping = 9.99;
  const total = subtotal + shipping;

  return (
    <div className="space-y-6" data-testid="cart-page">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearCart}
          data-testid="clear-cart"
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              data-testid={`cart-item-${item.productId}`}
              className="bg-white rounded-xl shadow-sm p-4 flex gap-4"
            >
              {/* Image */}
              <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    No img
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate" data-testid={`cart-item-name-${item.productId}`}>
                  {item.productName}
                </h3>
                <p className="text-gray-500 text-sm">{formatCurrency(item.price)} each</p>

                {/* Quantity controls */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    data-testid={`decrease-qty-${item.productId}`}
                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span
                    className="w-8 text-center font-medium text-sm"
                    data-testid={`qty-${item.productId}`}
                  >
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    data-testid={`increase-qty-${item.productId}`}
                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Price + Remove */}
              <div className="flex flex-col items-end justify-between">
                <span className="font-bold text-gray-900" data-testid={`cart-item-total-${item.productId}`}>
                  {formatCurrency(item.price * item.quantity)}
                </span>
                <button
                  onClick={() => removeItem(item.productId)}
                  data-testid={`remove-item-${item.productId}`}
                  className="text-red-500 hover:text-red-700 transition-colors p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div>
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6" data-testid="order-summary">
            <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal ({items.length} items)</span>
                <span data-testid="cart-subtotal">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span>{formatCurrency(shipping)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-3 border-t text-base">
                <span>Total</span>
                <span data-testid="cart-total">{formatCurrency(total)}</span>
              </div>
            </div>

            <Link href="/checkout" className="block mt-6">
              <Button className="w-full" size="lg" data-testid="checkout-button">
                Proceed to Checkout
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="ghost" className="w-full mt-2" data-testid="continue-shopping-link">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
