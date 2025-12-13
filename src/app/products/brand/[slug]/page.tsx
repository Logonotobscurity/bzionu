'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { Section } from '@/components/ui/section';
import { ProductCard } from '@/components/product-card';
import { getBrands, getProductsByBrand, getBrandStats } from '@/services/productService';
import { ProductSortOptions } from '@/components/product-sort-options';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PageHero } from '@/components/layout/PageHero';
import { CTASection } from '@/components/cta-section';
import { Brand, Product } from '@/lib/schema';

interface BrandStats {
  [key: string]: { productCount: number; categoryCount: number };
}

async function getBrandBySlug(slug: string): Promise<Brand | undefined> {
  const brands = await getBrands();
  return brands.find(b => b.slug === slug);
}

export default function BrandPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [brand, setBrand] = useState<Brand | null>(null);
  const [brandProducts, setBrandProducts] = useState<Product[]>([]);
  const [brandStats, setBrandStats] = useState<BrandStats>({});

  useEffect(() => {
    if (!slug) return;
    const fetchData = async () => {
      const brandData = await getBrandBySlug(slug);
      if (!brandData) {
        notFound();
        return;
      }
      setBrand(brandData ?? null);

      const [products, stats] = await Promise.all([
        getProductsByBrand(brandData.name),
        getBrandStats(),
      ]);
      setBrandProducts(products);
      setBrandStats(stats);
    };
    fetchData();
  }, [slug]);

  if (!brand) {
    return null; // Or a loading indicator
  }

  const stats = brandStats[brand.name] || { productCount: 0, categoryCount: 0 };

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Brands', href: '/products/brands' },
    { label: brand.name, href: `/products/brand/${brand.slug}` },
  ];

  return (
    <main className="flex-grow">
      <PageHero 
        preamble="Premium Brand Collection"
        title={brand.name}
        description={brand.brand_description ?? `Discover the complete range of quality products from ${brand.name}. We're proud to distribute their finest offerings.`}
        imageUrl={brand.imageUrl ?? ''}
        breadcrumbs={breadcrumbItems}
        stats={[
          { label: 'Quality Products', value: stats.productCount },
          { label: 'Product Categories', value: stats.categoryCount },
          { label: 'Customer Rating', value: 48 },
        ]}
        primaryCta={{
          text: 'Browse Products',
          href: `#products`,
        }}
        secondaryCta={{
            text: 'Browse All Products',
            href: '/products',
        }}
      />

      {/* Products Section */}
      <Section className="py-16 bg-white" id="products">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2">All {brand.name} Products</h2>
              <p className="text-lg text-slate-600">Browse our complete range of {brand.name} products across all categories</p>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                <span className="text-primary text-lg">{stats.productCount}</span> products found
              </p>
              <ProductSortOptions />
            </div>
          </div>
          
          {brandProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8">
              {brandProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} priority={index < 8} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-primary mb-2">No Products Yet</h3>
              <p className="text-slate-600 max-w-md mx-auto text-lg">Products from {brand.name} will be displayed here once they are available.</p>
              <Link href="/products/brands">
                <Button className="mt-6" variant="outline" size="lg">
                  Browse Other Brands
                </Button>
              </Link>
            </div>
          )}
        </div>
      </Section>

      {/* CTA Section */}
      <Section className="py-16 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CTASection
          title={`Discover More from ${brand.name}`}
          description="Browse our complete selection of premium products. We offer competitive pricing and reliable delivery to support your business growth."
          ctaText="Shop Now"
          ctaHref="#products"
        />
      </Section>
    </main>
  );
}
