
import "dotenv/config";
import { prisma } from "../src/lib/db";
import products from "../src/lib/data/all-products.json";
import brands from "../src/lib/data/brands.json";
import categories from "../src/lib/data/categories.json";
import companies from "../src/lib/data/companies.json";
import quotes from "../src/lib/data/quotes.json";
import users from "../src/lib/data/users.json";
import * as bcrypt from "bcryptjs";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

interface RawProduct {
  sku?: string;
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  isActive?: boolean;
  brandSlug?: string;
  brand?: string;
  companySlug?: string;
  company?: string;
  categorySlugs?: string[];
  categorySlug?: string;
  images?: string[];
}

interface RawUser {
  name: string;
  email: string;
  company?: string;
  role?: string;
}

function normalizeCategorySlugs(p: RawProduct): string[] {
  if (Array.isArray(p.categorySlugs)) return p.categorySlugs;
  if (p.categorySlug) return [p.categorySlug];
  return [];
}

async function main() {
  console.log("Start seeding...");

  // upsert users
  for (const u of users as RawUser[]) {
    const [firstName, ...lastNameParts] = u.name.split(" ");
    const lastName = lastNameParts.join(" ");

    await prisma.user.upsert({
      where: { email: u.email.toLowerCase() },
      update: {
        firstName: firstName,
        lastName: lastName,
        companyName: u.company,
        role: u.role || "customer",
      },
      create: {
        email: u.email.toLowerCase(),
        firstName: firstName,
        lastName: lastName,
        companyName: u.company,
        role: u.role || "customer",
      },
    });
  }

  // Create or update admin user
  const adminEmail = "bola@bzion.shop";
  const adminName = "Bola A";
  const [adminFirstName, ...adminLastNameParts] = adminName.split(" ");
  const adminLastName = adminLastNameParts.join(" ");
  const hashedPassword = await bcrypt.hash("password", 10); 

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail }});

  if (existingAdmin) {
    await prisma.user.update({
      where: { email: adminEmail },
      data: { // This is line 84 in the error
        password: hashedPassword,
        role: "admin",
      } as any,
    });
  } else {
    await prisma.user.create({
      data: { // This is line 92 in the error
        email: adminEmail,
        password: hashedPassword,
        firstName: adminFirstName,
        lastName: adminLastName,
        role: "admin",
      } as any,
    });
  }

  // upsert companies
  for (const c of companies) {
    await prisma.company.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: { slug: c.slug, name: c.name },
    });
  }

  // upsert brands
  for (const b of brands) {
    await prisma.brand.upsert({
      where: { slug: b.slug },
      update: { name: b.name },
      create: { slug: b.slug, name: b.name },
    });
  }

  // upsert categories
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: { slug: c.slug, name: c.name },
    });
  }

  // upsert products
  for (const pRaw of products as unknown[]) {
    const p = pRaw as RawProduct;

    const brandSlug = p.brandSlug ?? p.brand ?? undefined;
    const companySlug = p.companySlug ?? p.company ?? undefined;
    const categorySlugs = normalizeCategorySlugs(p);

    const brand =
      brandSlug
        ? await prisma.brand.findUnique({ where: { slug: String(brandSlug) } })
        : null;
    const company =
      companySlug
        ? await prisma.company.findUnique({ where: { slug: String(companySlug) } })
        : null;

    const upserted = await prisma.product.upsert({
      where: { sku: p.sku || "" },
      update: {
        name: p.name || "",
        description: p.description || null,
        price: p.price || null,
        isActive: p.isActive ?? true,
        brandId: brand?.id ?? undefined,
        companyId: company?.id ?? undefined,
      },
      create: {
        sku: p.sku || "",
        name: p.name || "",
        slug: p.slug || p.sku || "",
        description: p.description || null,
        price: p.price || null,
        isActive: p.isActive ?? true,
        brand: brand ? { connect: { id: brand.id } } : undefined,
        company: company ? { connect: { id: company.id } } : undefined,
      },
    });

    if (categorySlugs.length) {
      for (const cslug of categorySlugs) {
        const category = await prisma.category.findUnique({ where: { slug: cslug } });
        if (category) {
          await prisma.productCategory.upsert({
            where: {
              productId_categoryId: {
                productId: upserted.id,
                categoryId: category.id,
              },
            },
            update: {},
            create: { productId: upserted.id, categoryId: category.id },
          });
        }
      }
    }

    await prisma.productImage.deleteMany({ where: { productId: upserted.id } });
    if (p.images?.length) {
      for (let i = 0; i < p.images.length; i++) {
        const image = p.images[i];
        const url =
          typeof image === "string" && image.startsWith("http")
            ? image
            : `/products/${image}`;
        await prisma.productImage.create({
          data: {
            productId: upserted.id,
            url,
            alt: p.name || "",
            order: i,
          },
        });
      }
    }
  }

  // upsert quotes
  for (const q of quotes) {
    const upsertedQuote = await prisma.quote.upsert({
      where: { reference: q.reference },
      update: {
        status: q.status,
        buyerContactEmail: q.buyerContactEmail,
        buyerContactPhone: q.buyerContactPhone,
      },
      create: {
        reference: q.reference,
        status: q.status,
        buyerContactEmail: q.buyerContactEmail,
        buyerContactPhone: q.buyerContactPhone,
      },
    });

    for (const line of q.lines) {
      await prisma.quoteLine.create({
        data: {
          quoteId: upsertedQuote.id,
          productSku: line.productSku,
          productName: line.productName,
          qty: line.qty,
          unitPrice: line.unitPrice,
        },
      });
    }
  }

  console.log("Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
