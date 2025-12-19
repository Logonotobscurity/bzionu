import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Prisma } from '@prisma/client';

interface ProductsPageProps {
  searchParams: {
    search?: string;
  };
}

async function getProducts(search: string | undefined) {
  const where: Prisma.ProductWhereInput = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const products = await prisma.product.findMany({
    where,
    select: {
      id: true,
      sku: true,
      name: true,
      price: true,
      stock: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return products;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const products = await getProducts(searchParams.search);

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Products</CardTitle>
            <CardDescription>Manage your products.</CardDescription>
          </div>
          <Link href="/admin/products/new">
            <Button>Create Product</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <form className="mb-4">
            <Input name="search" placeholder="Search by name or SKU" defaultValue={searchParams.search || ''} />
          </form>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <Button variant="outline" size="sm" className="mr-2">
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/admin/products/${product.id}/stock`}>
                      <Button variant="outline" size="sm">
                        Manage Stock
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
