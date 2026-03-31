'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useToastStore } from '@/lib/store';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  price: z.string().refine((v) => parseFloat(v) > 0, 'Price must be greater than 0'),
  category: z.enum(['Electronics', 'Clothing', 'Books', 'Home', 'Sports']),
  stock: z.string().refine((v) => parseInt(v) >= 0, 'Stock must be 0 or greater'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  imageUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
});

type ProductForm = z.infer<typeof productSchema>;

const categoryOptions = [
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Clothing', label: 'Clothing' },
  { value: 'Books', label: 'Books' },
  { value: 'Home', label: 'Home' },
  { value: 'Sports', label: 'Sports' },
];

export default function NewProductPage() {
  const router = useRouter();
  const { addToast } = useToastStore();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: { category: 'Electronics', stock: '0' },
  });

  async function onSubmit(data: ProductForm) {
    setLoading(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          price: parseFloat(data.price),
          stock: parseInt(data.stock),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        addToast(json.error || 'Failed to create product', 'error');
        return;
      }

      addToast('Product created successfully', 'success');
      router.push('/products');
    } catch {
      addToast('Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl" data-testid="new-product-page">
      <div className="flex items-center gap-3">
        <Link href="/products">
          <Button variant="ghost" size="sm" data-testid="back-button">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Product</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" data-testid="product-form">
          <Input
            label="Product Name"
            placeholder="e.g. MacBook Pro 14&quot;"
            data-testid="product-name-input"
            error={errors.name?.message}
            {...register('name')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price ($)"
              type="number"
              step="0.01"
              placeholder="0.00"
              data-testid="product-price-input"
              error={errors.price?.message}
              {...register('price')}
            />

            <Input
              label="Stock"
              type="number"
              placeholder="0"
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
              placeholder="Describe the product..."
              data-testid="product-description-input"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('description')}
            />
            {errors.description && (
              <p data-testid="input-error" className="text-xs text-red-600">{errors.description.message}</p>
            )}
          </div>

          <Input
            label="Image URL (optional)"
            type="url"
            placeholder="https://..."
            data-testid="product-image-input"
            error={errors.imageUrl?.message}
            {...register('imageUrl')}
          />

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Link href="/products">
              <Button variant="secondary" type="button" data-testid="cancel-button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" loading={loading} data-testid="submit-product">
              Create Product
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
