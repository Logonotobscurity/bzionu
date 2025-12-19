
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import * as bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, password, companyName } = await req.json();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        companyName,
      },
    });

    return NextResponse.json({ message: 'User created successfully', user }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
