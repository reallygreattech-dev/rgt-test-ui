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

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { setUser, setLoading } = useUserStore();
  const [serverError, setServerError] = useState('');
  const [loading, setLocalLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  async function onSubmit(data: SignupForm) {
    setServerError('');
    setLocalLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error || 'Signup failed');
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
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Create account</h2>
      <p className="text-gray-500 mb-6">Sign up to get started</p>

      {serverError && (
        <div
          data-testid="signup-error"
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
        >
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="signup-form">
        <Input
          label="Full name"
          type="text"
          placeholder="John Doe"
          data-testid="name-input"
          error={errors.name?.message}
          {...register('name')}
        />

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
          placeholder="Min. 6 characters"
          data-testid="password-input"
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirm password"
          type="password"
          placeholder="Repeat your password"
          data-testid="confirm-password-input"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          loading={loading}
          className="w-full"
          data-testid="signup-submit"
        >
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700" data-testid="login-link">
          Sign in
        </Link>
      </p>
    </>
  );
}
