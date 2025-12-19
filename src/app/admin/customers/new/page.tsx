import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomerForm } from '../_components/customer-form';

export default function NewCustomerPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create Customer</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerForm />
        </CardContent>
      </Card>
    </div>
  );
}
