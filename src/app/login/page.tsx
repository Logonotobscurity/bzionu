"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { login } from '@/lib/auth';
import { initializeMockActivities } from '@/lib/mock-data';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Demo credentials for quick testing
  const demoCredentials = [
    { email: 'demo@bzion.shop', password: 'demo123', name: 'John Doe' },
    { email: 'test@bzion.shop', password: 'test123', name: 'Jane Smith' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      initializeMockActivities();

      toast({
        title: 'Login Successful',
        description: `Welcome back, ${email}!`,
      });
      router.push('/account');
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'Invalid credentials',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Login</h1>
          <p className="text-gray-500 dark:text-gray-400">Access your BZION account</p>
        </div>

        <div className="space-y-4">
          {demoCredentials.map((cred, index) => (
            <Button 
              key={index} 
              variant="outline" 
              className="w-full"
              onClick={() => fillDemoCredentials(cred.email, cred.password)}
            >
              Login as {cred.name}
            </Button>
          ))}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300 dark:border-gray-600"></span>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500 dark:bg-gray-800 dark:text-gray-400">Or continue with</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="m@example.com" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" passHref>
                <a className="text-sm text-blue-600 hover:underline dark:text-blue-500">Forgot password?</a>
              </Link>
            </div>
            <Input 
              id="password" 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <p className="text-sm text-center text-gray-500 dark:text-gray-400">
          Don't have an account? <Link href="/register" passHref><a className="font-medium text-blue-600 hover:underline dark:text-blue-500">Register</a></Link>
        </p>
      </div>
    </div>
  );
}
