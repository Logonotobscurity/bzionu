import Link from 'next/link';
import { Logo } from '@/components/logo';
import { FOOTER_LINKS } from '@/lib/config/constants';
import { FooterMobileAccordion } from './footer-mobile-accordion';
import { FooterNewsletter } from './footer-newsletter';
import { Section } from '../ui/section';
import FooterLogo from './footer-logo'; // Changed from named import to default import

export const Footer = () => {
  const linkCategories = {
      Platform: FOOTER_LINKS.platform,
      Company: FOOTER_LINKS.company,
      Customers: FOOTER_LINKS.customers,
  };

  return (
    <footer className="bg-primary text-white" aria-labelledby="footer-heading">
        <h2 id="footer-heading" className="sr-only">Footer</h2>
        <Section className="!py-section-md">
            {/* Newsletter Section */}
            <div className="pb-12 md:pb-16 border-b-4 border-secondary">
                <FooterNewsletter />
            </div>
            
            {/* Main Footer Content */}
            <div className="pt-12 md:pt-16">
              {/* Desktop: Grid Layout */}
              <div className="hidden md:grid md:grid-cols-12 gap-x-8 lg:gap-x-12 gap-y-8 pb-12 border-b border-white/10">
                
                {/* Logo and Description */}
                <div className="col-span-1 md:col-span-4 lg:col-span-3">
                  <FooterLogo className="h-10 w-auto mb-6" /> {/* Replaced Logo with FooterLogo */}
                  <p className="text-sm text-slate-200 font-light leading-relaxed">
                    Your trusted supply partner for authentic food products in Nigeria. We are committed to reliability, price stability, and operational excellence.
                  </p>
                </div>

                {/* Links Grid */}
                <div className="col-span-1 md:col-span-5 lg:col-span-6">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(linkCategories).map(([category, links]) => (
                        <div key={category}>
                            <h3 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">{category}</h3>
                            <ul className="space-y-2">
                            {links.map((link: { title: string; href: string }) => (
                                <li key={link.title}>
                                <Link href={link.href} className="text-sm text-slate-300 hover:text-white transition-colors">
                                    {link.title}
                                </Link>
                                </li>
                            ))}
                            </ul>
                        </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile: Accordion Layout */}
              <div className="md:hidden pb-8 border-b border-white/10">
                <FooterMobileAccordion />
              </div>
            </div>
            
            {/* Copyright */}
            <div className="pt-8 text-center">
                <p className='text-sm text-slate-300'>&copy; {new Date().getFullYear()} BZION Hub Digital. All rights reserved.</p>
            </div>
        </Section>
      </footer>
  );
};