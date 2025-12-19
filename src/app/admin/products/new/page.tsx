import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductForm } from '../_components/product-form';

export default function NewProductPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create Product</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm />
        </CardContent>
      </Card>
    </div>
  );
}
