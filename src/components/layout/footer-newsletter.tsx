'use client';

import { NewsletterForm } from '@/components/forms/newsletter-form';
import { Instagram, Linkedin, Facebook, Twitter, Music } from 'lucide-react';

export function FooterNewsletter() {

    return (
        <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
                <h3 className="text-2xl font-semibold text-white">We have high standards for emails too.</h3>
            </div>
            <div>
                <div className="relative flex items-start bg-slate-100/10 rounded-md p-2 flex-col sm:flex-row sm:items-center">
                    <NewsletterForm />
                </div>
                 <div className="mt-4 flex justify-end items-center gap-4">
                    <a href="https://www.linkedin.com/company/bzion-shop" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-white hover:text-secondary"><Linkedin size={20}/></a>
                    <a href="https://www.instagram.com/bzion.shop" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white hover:text-secondary"><Instagram size={20}/></a>
                    <a href="https://www.facebook.com/share/1FDUZrAczB/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-white hover:text-secondary"><Facebook size={20}/></a>
                    <a href="https://twitter.com/bzion" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-white hover:text-secondary"><Twitter size={20}/></a>
                    <a href="https://www.tiktok.com/@bzion.shop" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-white hover:text-secondary"><Music size={20}/></a>
                </div>
            </div>
        </div>
    );
}
