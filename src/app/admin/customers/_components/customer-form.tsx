'use client';

import { useFormState } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createCustomer, updateCustomer } from '@/app/admin/_actions/customers';
import { Customer } from '@prisma/client';

interface CustomerFormProps {
  customer?: Customer;
}

interface FormState {
  firstName?: string[];
  lastName?: string[];
  email?: string[];
}

export function CustomerForm({ customer }: CustomerFormProps) {
  const [error, action] = useFormState<FormState>(
    customer ? updateCustomer.bind(null, customer.id) : createCustomer,
    {}
  );

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="firstName">First Name</Label>
        <Input
          id="firstName"
          name="firstName"
          defaultValue={customer?.firstName || ''}
        />
        {error.firstName && (
          <p className="text-red-500 text-xs">{error.firstName[0]}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastName">Last Name</Label>
        <Input
          id="lastName"
          name="lastName"
          defaultValue={customer?.lastName || ''}
        />
        {error.lastName && (
          <p className="text-red-500 text-xs">{error.lastName[0]}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" defaultValue={customer?.email} />
        {error.email && <p className="text-red-500 text-xs">{error.email[0]}</p>}
      </div>
      <Button type="submit">{customer ? 'Update' : 'Create'}</Button>
    </form>
  );
}
