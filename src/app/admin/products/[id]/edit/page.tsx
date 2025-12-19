import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductForm } from '../../_components/product-form';
import { notFound } from 'next/navigation';

interface EditProductPageProps {
  params: {
    id: string;
  };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(params.id, 10) },
  });

  if (!product) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Product</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm product={product} />
        </CardContent>
      </Card>
    </div>
  );
}
