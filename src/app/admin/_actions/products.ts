'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const productSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  inStock: z.coerce.boolean(),
});

export async function createProduct(prevState: unknown, formData: FormData) {
  const result = productSchema.safeParse(Object.fromEntries(formData.entries()));
  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;

  await prisma.product.create({
    data: {
      sku: data.sku,
      name: data.name,
      description: data.description,
      price: data.price,
      inStock: data.inStock,
      slug: data.name.toLowerCase().replace(/\s+/g, '-'), // simple slug generation
    },
  });

  revalidatePath('/admin/products');
  redirect('/admin/products');
}

export async function updateProduct(id: number, prevState: unknown, formData: FormData) {
  const result = productSchema.safeParse(Object.fromEntries(formData.entries()));
  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;

  await prisma.product.update({
    where: { id },
    data: {
      sku: data.sku,
      name: data.name,
      description: data.description,
      price: data.price,
      inStock: data.inStock,
      slug: data.name.toLowerCase().replace(/\s+/g, '-'), // simple slug generation
    },
  });

  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${id}/edit`);
  redirect('/admin/products');
}
