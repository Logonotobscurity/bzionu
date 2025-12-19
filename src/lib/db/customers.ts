
import prisma from '@/lib/prisma';

export async function getCustomers() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return customers;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch customers.');
  }
}

export async function getCustomerById(id: string) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
    });
    return customer;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch customer.');
  }
}
