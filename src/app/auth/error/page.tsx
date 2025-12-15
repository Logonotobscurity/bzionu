/**
 * Error page for authentication
 */

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';

const AuthErrorPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md p-6 space-y-4">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-red-600">
            Authentication Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-700 dark:text-gray-300">
            Something went wrong during the authentication process. Please try
            again.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link
            href="/login"
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Back to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthErrorPage;
