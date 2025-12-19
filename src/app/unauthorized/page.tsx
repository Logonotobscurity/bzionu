
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageHero } from '@/components/layout/PageHero';

export default function UnauthorizedPage() {
  return (
    <>
      <PageHero
        title="Access Denied"
        description="You do not have the necessary permissions to access this page."
      />
      <div className="container mx-auto text-center py-20">
        <p className="mb-8 text-lg">
          This content is restricted to administrators. If you believe this is an error, please contact support.
        </p>
        <Button asChild size="lg">
          <Link href="/">Return to Homepage</Link>
        </Button>
      </div>
    </>
  );
}
