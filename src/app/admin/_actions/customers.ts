'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const customerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
});

export async function createCustomer(prevState: unknown, formData: FormData) {
  const result = customerSchema.safeParse(Object.fromEntries(formData.entries()));
  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;

  await prisma.customer.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      source: 'MANUAL',
      customerType: 'INDIVIDUAL',
    },
  });

  revalidatePath('/admin/customers');
  redirect('/admin/customers');
}

export async function updateCustomer(id: string, prevState: unknown, formData: FormData) {
  const result = customerSchema.safeParse(Object.fromEntries(formData.entries()));
  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;

  await prisma.customer.update({
    where: { id },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
    },
  });

  revalidatePath('/admin/customers');
  revalidatePath(`/admin/customers/${id}/edit`);
  redirect('/admin/customers');
}

export async function archiveCustomer(id: string) {
  await prisma.customer.update({
    where: { id },
    data: { status: 'ARCHIVED' },
  });

  revalidatePath('/admin/customers');
}
