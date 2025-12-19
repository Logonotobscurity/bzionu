import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { adjustStock } from '@/app/admin/_actions/stock';

interface ManageStockPageProps {
  params: {
    id: string;
  };
}

async function getProduct(id: number) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      stockMovements: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });
  return product;
}

export default async function ManageStockPage({ params }: ManageStockPageProps) {
  const product = await getProduct(parseInt(params.id, 10));

  if (!product) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Manage Stock for {product.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Adjust Stock</h3>
              <form action={adjustStock} className="space-y-4">
                <input type="hidden" name="productId" value={product.id} />
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" name="quantity" type="number" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" />
                </div>
                <Button type="submit">Adjust Stock</Button>
              </form>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Stock History</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {product.stockMovements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>{movement.createdAt.toLocaleString()}</TableCell>
                      <TableCell>{movement.quantity}</TableCell>
                      <TableCell>{movement.type}</TableCell>
                      <TableCell>{movement.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
