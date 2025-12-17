import HomeCarousel from '@/components/home-carousel';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import dynamicComponent from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { getBestSellers, getCategories } from '@/services/productService';
import { BestSellersSection } from '@/components/best-sellers-section';

export const revalidate = 3600; // Revalidate every hour
export const dynamic = 'force-dynamic';

const ValueProps = dynamicComponent(() => import('@/components/value-props').then(mod => mod.default), {
  loading: () => <Skeleton className="h-[500px] w-full" />,
});
const InfoBlocks = dynamicComponent(() => import('@/components/info-blocks').then(mod => mod.default), {
  loading: () => <Skeleton className="h-[500px] w-full" />,
});
const LocationsSection = dynamicComponent(() => import('@/components/locations-section').then(mod => mod.LocationsSection), {
  loading: () => <Skeleton className="h-[400px] w-full" />,
});
const Testimonials = dynamicComponent(() => import('@/components/testimonials').then(mod => mod.default), {
  loading: () => <Skeleton className="h-[400px] w-full" />,
});
const FaqSection = dynamicComponent(() => import('@/components/faq-section').then(mod => mod.default), {
  loading: () => <Skeleton className="h-[500px] w-full" />,
});


export default async function Home() {

  const [products, categories] = await Promise.all([
    getBestSellers(),
    getCategories(),
  ]);

  const carouselSlides = [
    {
      image: 'https://i.ibb.co/7txX6Xm6/Gemini-Generated-Image-errnwoerrnwoerrn.png',
      title: "Your Trusted Partner in Nigeria’s Food Supply Chain",
      description: "We work with businesses to ensure steady access to authentic and high quality food products, supported by reliability, price stability, and transparency at every stage.",
      cta: "Shop Now",
      href: "/products"
    },
    {
      image: getPlaceholderImage('hero-2'),
      title: "We Deliver Stability in an Unstable Market",
      description: "Our logistics network is built to anticipate market changes, minimize shortages, and guarantee consistent supply needed for your business to thrive.",
      cta: "Learn About Our Logistics",
      href: "/about"
    },
    {
      image: getPlaceholderImage('hero-3'),
      title: "Quality You Can Count On",
      description: "We supply a diverse range of trusted products sourced directly from reputable manufacturers, ensuring authenticity and consistent value.",
      cta: "Explore Our Brands",
      href: "/products"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <div className='h-[500px] md:h-[700px] w-full -mt-[1px]'>
        <HomeCarousel slides={carouselSlides} />
      </div>
      
      <ValueProps />
      <InfoBlocks />
      <BestSellersSection products={products} categories={categories} />
      <LocationsSection />
      <Testimonials />
      <FaqSection />
    </div>
  );
}
