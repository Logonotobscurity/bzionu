'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const stockAdjustmentSchema = z.object({
  productId: z.coerce.number(),
  quantity: z.coerce.number(),
  notes: z.string().optional(),
});

export async function adjustStock(formData: FormData) {
  const result = stockAdjustmentSchema.safeParse(Object.fromEntries(formData.entries()));
  if (result.success === false) {
    throw new Error('Invalid form data');
  }

  const data = result.data;

  await prisma.$transaction(async (tx) => {
    await tx.stockMovement.create({
      data: {
        productId: data.productId,
        quantity: data.quantity,
        type: 'adjustment',
        notes: data.notes,
      },
    });

    await tx.product.update({
      where: { id: data.productId },
      data: {
        stock: {
          increment: data.quantity,
        },
      },
    });
  });

  revalidatePath(`/admin/products`);
  revalidatePath(`/admin/products/${data.productId}/stock`);
}
