
import prisma from '@/lib/prisma';

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        brand: true,
      },
    });
    return products;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch products.');
  }
}

export async function getProductById(id: number) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        brand: true,
        company: true,
        categories: {
          include: {
            category: true,
          },
        },
        images: true,
      },
    });
    return product;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch product.');
  }
}
