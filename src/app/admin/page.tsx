import { prisma } from '@/lib/db';
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

async function getStats() {
  const userCount = await prisma.user.count();
  const productCount = await prisma.product.count();
  return { userCount, productCount };
}

async function getProducts() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      sku: true,
      name: true,
      price: true,
      inStock: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return products;
}

async function getUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return users;
}

export default async function AdminPage() {
  const { userCount, productCount } = await getStats();
  const users = await getUsers();
  const products = await getProducts();

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{userCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{productCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>A list of all products.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>In Stock</TableHead>
                <TableHead className="text-right">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell>
                    <Badge variant={product.inStock ? 'outline' : 'destructive'}>
                      {product.inStock ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>A list of all users.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'destructive' : 'outline'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {new Date(user.createdAt).toLocaleDateString()}
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
