'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToastStore } from '@/lib/store';
import { Product } from '@/lib/types';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  price: z.string().refine((v) => parseFloat(v) > 0, 'Price must be greater than 0'),
  category: z.enum(['Electronics', 'Clothing', 'Books', 'Home', 'Sports']),
  stock: z.string().refine((v) => parseInt(v) >= 0, 'Stock must be 0 or greater'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  imageUrl: z.string().optional(),
});

type ProductForm = z.infer<typeof productSchema>;

const categoryOptions = [
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Clothing', label: 'Clothing' },
  { value: 'Books', label: 'Books' },
  { value: 'Home', label: 'Home' },
  { value: 'Sports', label: 'Sports' },
];

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { addToast } = useToastStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  });

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
        reset({
          name: data.product.name,
          price: String(data.product.price),
          category: data.product.category,
          stock: String(data.product.stock),
          description: data.product.description,
          imageUrl: data.product.imageUrl || '',
        });
      } catch {
        router.push('/products');
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id, router, reset]);

  async function onSubmit(data: ProductForm) {
    setSaving(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          price: parseFloat(data.price),
          stock: parseInt(data.stock),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        addToast(json.error || 'Failed to update product', 'error');
        return;
      }

      addToast('Product updated successfully', 'success');
      router.push(`/products/${id}`);
    } catch {
      addToast('Something went wrong', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl" data-testid="loading-skeleton">
        <Skeleton className="h-8 w-48" />
        <div className="bg-white rounded-xl p-8 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl" data-testid="edit-product-page">
      <div className="flex items-center gap-3">
        <Link href={`/products/${id}`}>
          <Button variant="ghost" size="sm" data-testid="back-button">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" data-testid="edit-product-form">
          <Input
            label="Product Name"
            data-testid="product-name-input"
            error={errors.name?.message}
            {...register('name')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price ($)"
              type="number"
              step="0.01"
              data-testid="product-price-input"
              error={errors.price?.message}
              {...register('price')}
            />
            <Input
              label="Stock"
              type="number"
              data-testid="product-stock-input"
              error={errors.stock?.message}
              {...register('stock')}
            />
          </div>

          <Select
            label="Category"
            data-testid="product-category-select"
            options={categoryOptions}
            error={errors.category?.message}
            {...register('category')}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={4}
              data-testid="product-description-input"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('description')}
            />
            {errors.description && (
              <p data-testid="input-error" className="text-xs text-red-600">{errors.description.message}</p>
            )}
          </div>

          <Input
            label="Image URL"
            data-testid="product-image-input"
            error={errors.imageUrl?.message}
            {...register('imageUrl')}
          />

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Link href={`/products/${id}`}>
              <Button variant="secondary" type="button" data-testid="cancel-button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" loading={saving} data-testid="submit-product">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
