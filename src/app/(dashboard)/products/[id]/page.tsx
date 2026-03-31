'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Edit } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge, getStockBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCartStore, useToastStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { Product } from '@/lib/types';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { addItem } = useCartStore();
  const { addToast } = useToastStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) {
          router.push('/products');
          return;
        }
        const data = await res.json();
        setProduct(data.product);
      } catch {
        router.push('/products');
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id, router]);

  function handleAddToCart() {
    if (!product) return;
    setAddingToCart(true);
    addItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity,
      imageUrl: product.imageUrl,
    });
    addToast(`${product.name} added to cart`, 'success');
    setTimeout(() => setAddingToCart(false), 500);
  }

  if (loading) {
    return (
      <div className="space-y-6" data-testid="loading-skeleton">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-80" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const stock = getStockBadge(product.stock);

  return (
    <div className="space-y-6" data-testid="product-detail-page">
      <div className="flex items-center gap-3">
        <Link href="/products">
          <Button variant="ghost" size="sm" data-testid="back-button">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Product Detail</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="aspect-square bg-gray-100 overflow-hidden">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                data-testid="product-image"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-gray-400 text-lg"
                data-testid="product-image-placeholder"
              >
                No image available
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-8 flex flex-col">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900" data-testid="product-name">
                {product.name}
              </h2>
              <Badge variant={stock.variant} data-testid={`badge-${product.id}-stock`}>
                {stock.label}
              </Badge>
            </div>

            <p className="text-sm text-gray-500 mb-4" data-testid="product-category">
              Category: {product.category}
            </p>

            <p className="text-3xl font-bold text-gray-900 mb-4" data-testid="product-price">
              {formatCurrency(product.price)}
            </p>

            <p className="text-gray-600 mb-6 flex-1" data-testid="product-description">
              {product.description}
            </p>

            <p className="text-sm text-gray-500 mb-6" data-testid="product-stock">
              Stock: {product.stock} units
            </p>

            {/* Quantity selector */}
            <div className="flex items-center gap-3 mb-6">
              <label className="text-sm font-medium text-gray-700">Quantity:</label>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  data-testid="quantity-decrease"
                  className="px-3 py-2 hover:bg-gray-100 transition-colors rounded-l-lg"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span
                  className="px-4 py-2 font-medium border-x border-gray-300"
                  data-testid="quantity-value"
                >
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  data-testid="quantity-increase"
                  className="px-3 py-2 hover:bg-gray-100 transition-colors rounded-r-lg"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                loading={addingToCart}
                disabled={product.stock === 0}
                className="flex-1"
                data-testid="add-to-cart-button"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
              <Link href={`/products/${product.id}/edit`}>
                <Button variant="secondary" data-testid="edit-product-button">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
