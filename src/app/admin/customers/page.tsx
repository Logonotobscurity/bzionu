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

interface CustomersPageProps {
  searchParams: {
    search?: string;
  };
}

async function getCustomers(search: string | undefined) {
  const where: Prisma.CustomerWhereInput = search
    ? {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const customers = await prisma.customer.findMany({
    where,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      status: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return customers;
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const customers = await getCustomers(searchParams.search);

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Customers</CardTitle>
            <CardDescription>Manage your customers.</CardDescription>
          </div>
          <Link href="/admin/customers/new">
            <Button>Create Customer</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <form className="mb-4">
            <Input name="search" placeholder="Search by name or email" defaultValue={searchParams.search || ''} />
          </form>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.firstName} {customer.lastName}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>
                    <Badge variant={customer.status === 'ACTIVE' ? 'outline' : 'destructive'}>
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/customers/${customer.id}/edit`}>
                      <Button variant="outline" size="sm" className="mr-2">
                        Edit
                      </Button>
                    </Link>
                    {/* Add archive functionality here */}
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
