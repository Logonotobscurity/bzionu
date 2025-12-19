
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // Handle redirects for already logged-in users or after successful login
  useEffect(() => {
    if (status === 'authenticated') {
      const userRole = session.user?.role;
      const redirectUrl = userRole === 'admin' ? '/admin' : '/account';
      const params = searchParams.toString();
      
      router.push(`${redirectUrl}${params ? `?${params}` : ''}`);
    }
  }, [status, session, router, searchParams]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false, // Important: We are handling the redirect manually
      });

      if (result?.error) {
        toast({
          title: 'Error',
          description: result.error === 'CredentialsSignin' ? 'Invalid email or password.' : 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      }
      // On success, the useEffect will handle the redirect.
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
       toast({
        title: 'Email Required',
        description: 'Please enter your email address to receive a magic link.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      await signIn('email', { email, redirect: false });
      toast({
        title: 'Magic Link Sent',
        description: 'Check your email for a link to log in.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // If loading session, show a loading state to prevent flickering
  if (status === 'loading' || status === 'authenticated') {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Loading...</p>
        </div>
    );
  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900'>
      <div className='w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>Login</h1>
          <p className='text-gray-500 dark:text-gray-400'>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              placeholder='m@example.com'
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div>
            <Label htmlFor='password'>Password</Label>
            <Input
              id='password'
              type='password'
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              Or continue with
            </span>
          </div>
        </div>
        
        <Button onClick={handleMagicLink} className='w-full' variant='secondary' disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Magic Link'}
        </Button>

        <p className='text-sm text-center text-gray-500 dark:text-gray-400'>
          Don't have an account?{' '}
          <Link href='/register' className='font-medium text-blue-600 hover:underline dark:text-blue-500'>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
