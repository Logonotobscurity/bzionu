
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const PasswordStrength = ({ password }: { password: string }) => {
  const getStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getStrength();
  const color = ['gray', 'red', 'orange', 'yellow', 'lime', 'green'][strength];
  const label = ['Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength];

  return (
    <div className="flex items-center mt-2">
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div className={`h-2.5 rounded-full`} style={{ width: `${(strength / 5) * 100}%`, backgroundColor: color }} />
      </div>
      <div className="ml-4 text-sm font-medium">{label}</div>
    </div>
  );
};

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure your passwords match.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const nameParts = fullName.split(' ');
      const firstName = nameParts.shift() || '';
      const lastName = nameParts.join(' ');

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, email, password, companyName }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Something went wrong');
      }

      toast({
        title: 'Registration Successful',
        description: 'You have successfully created an account.',
      });

      router.push('/login');

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900'>
      <div className='w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>Create an Account</h1>
          <p className='text-gray-500 dark:text-gray-400'>Enter your details to register.</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <Label htmlFor='fullName'>Full Name</Label>
            <Input id='fullName' type='text' required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor='email'>Email</Label>
            <Input id='email' type='email' required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor='password'>Password</Label>
            <Input id='password' type='password' required value={password} onChange={(e) => setPassword(e.target.value)} />
            <PasswordStrength password={password} />
          </div>
          <div>
            <Label htmlFor='confirmPassword'>Confirm Password</Label>
            <Input id='confirmPassword' type='password' required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          <div>
            <Label htmlFor='companyName'>Company Name (Optional)</Label>
            <Input id='companyName' type='text' value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </Button>
        </form>

        <p className='text-sm text-center text-gray-500 dark:text-gray-400'>
          Already have an account?{' '}
          <Link href='/login'>
            <span className='font-medium text-blue-600 hover:underline dark:text-blue-500'>
              Login
            </span>
          </Link>
        </p>
      </div>
    </div>
  );
}
