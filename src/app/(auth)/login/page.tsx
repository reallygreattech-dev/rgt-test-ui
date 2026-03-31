'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/lib/store';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setLoading } = useUserStore();
  const [serverError, setServerError] = useState('');
  const [loading, setLocalLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    setServerError('');
    setLocalLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error || 'Login failed');
        return;
      }

      setUser({
        sub: json.user.id,
        email: json.user.email,
        name: json.user.name,
        role: json.user.role,
      });
      setLoading(false);
      router.push('/dashboard');
      router.refresh();
    } catch {
      setServerError('Something went wrong. Please try again.');
    } finally {
      setLocalLoading(false);
    }
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
      <p className="text-gray-500 mb-6">Sign in to your account</p>

      {serverError && (
        <div
          data-testid="login-error"
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
        >
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="login-form">
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          data-testid="email-input"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          data-testid="password-input"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button
          type="submit"
          loading={loading}
          className="w-full"
          data-testid="login-submit"
        >
          Sign in
        </Button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          Test credentials:{' '}
          <span className="font-mono text-xs bg-gray-100 px-1 rounded">admin@test.com</span> /{' '}
          <span className="font-mono text-xs bg-gray-100 px-1 rounded">password123</span>
        </p>
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-700" data-testid="signup-link">
          Sign up
        </Link>
      </p>
    </>
  );
}
