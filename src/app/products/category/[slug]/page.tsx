'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/ui/section";
import { getCategories, getProductsByCategory, getCategoryStats } from "@/services/productService";
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ProductSortOptions } from '@/components/product-sort-options';
import { CTASection } from '@/components/cta-section';
import { Category, Product } from '@/lib/schema';

interface CategoryStats {
    [key: string]: { productCount: number; brandCount: number };
}

async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const categories = await getCategories();
    return categories.find(c => c.slug === slug);
}

export default function CategoryPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [category, setCategory] = useState<Category | null>(null);
    const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
    const [categoryStats, setCategoryStats] = useState<CategoryStats>({});

    useEffect(() => {
        if (!slug) return;
        const fetchData = async () => {
            const categoryData = await getCategoryBySlug(slug);

            if (!categoryData) {
                notFound();
                return;
            }
            setCategory(categoryData);

            const [products, stats] = await Promise.all([
                getProductsByCategory(slug),
                getCategoryStats(),
            ]);
            setCategoryProducts(products);
            setCategoryStats(stats);
        };

        fetchData();
    }, [slug]);

    if (!category) {
        return null; // Or a loading indicator
    }

    const stats = categoryStats[slug] || { productCount: 0, brandCount: 0 };

    return (
        <main className="flex-grow">
            <PageHero
                preamble="Shop by Category"
                title={category.name}
                description={category.description || "Browse our complete selection of high-quality products in this category. Find exactly what your business needs."}
                stats={[
                    { label: 'Products Available', value: stats.productCount },
                    { label: 'Trusted Brands', value: stats.brandCount },
                    { label: 'Quality Assured', value: 100 },
                ]}
                primaryCta={{
                    text: 'View Products',
                    href: '#products',
                }}
                secondaryCta={{
                    text: 'Browse All Products',
                    href: '/products',
                }}
            />

            <Section className="py-16 bg-white" id="products">
                <div className="container mx-auto px-4">
                    <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2">All {category.name} Products</h2>
                            <p className="text-lg text-slate-600">Browse our complete range of {category.name.toLowerCase()} products across trusted brands</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <p className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                                <span className="text-primary text-lg">{stats.productCount}</span> products found
                            </p>
                            <ProductSortOptions />
                        </div>
                    </div>

                    {categoryProducts.length > 0 ? (
                        <div className="w-full grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8 overflow-hidden">
                            {categoryProducts.map((product, index) => (
                                <ProductCard key={product.id} product={product} priority={index < 8} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50">
                            <div className="text-6xl mb-4">📂</div>
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-primary mb-2">No Products Yet</h3>
                            <p className="text-slate-600 max-w-md mx-auto text-lg">Products in the {category.name} category will be displayed here once they are available.</p>
                            <Link href="/products/categories">
                                <Button className="mt-6" variant="outline" size="lg">
                                    Browse Other Categories
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </Section>

            {/* CTA Section */}
            <Section className="py-16 bg-gradient-to-r from-primary/5 to-secondary/5">
                <CTASection
                    title={`Complete Your ${category.name} Inventory`}
                    description="Find everything you need in the product category. Partner with BZION for reliable supply and competitive pricing."
                    ctaText="View All Products"
                    ctaHref="#products"
                />
            </Section>
        </main>
      );
}
