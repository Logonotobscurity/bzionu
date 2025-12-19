'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useFormState } from 'react-dom';
import { createProduct, updateProduct } from '@/app/admin/_actions/products';
import { Product } from '@prisma/client';

interface ProductFormProps {
  product?: Product;
}

interface FormState {
  sku?: string[];
  name?: string[];
  price?: string[];
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [error, action] = useFormState<FormState>(
    product ? updateProduct.bind(null, product.id) : createProduct,
    {}
  );

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="sku">SKU</Label>
        <Input id="sku" name="sku" defaultValue={product?.sku} />
        {error.sku && <p className="text-red-500 text-xs">{error.sku[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={product?.name} />
        {error.name && <p className="text-red-500 text-xs">{error.name[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={product?.description || ''}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="price">Price</Label>
        <Input
          id="price"
          name="price"
          type="number"
          step="0.01"
          defaultValue={product?.price || 0}
        />
        {error.price && <p className="text-red-500 text-xs">{error.price[0]}</p>}
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="inStock" name="inStock" defaultChecked={product?.inStock} />
        <Label htmlFor="inStock">In Stock</Label>
      </div>
      <Button type="submit">{product ? 'Update' : 'Create'}</Button>
    </form>
  );
}
