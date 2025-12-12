'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface NewsletterPopupProps {
  delay?: number; // Delay before showing popup in ms
}

export const NewsletterPopup = ({ delay = 10000 }: NewsletterPopupProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for reset parameter in URL (for testing)
    const params = new URLSearchParams(window.location.search);
    const shouldReset = params.has('reset-newsletter');
    if (shouldReset) {
      localStorage.removeItem('bzion-newsletter-dismissed');
      setIsOpen(true);
      return;
    }

    // Check if user has already dismissed this popup
    const hasDismissed = localStorage.getItem('bzion-newsletter-dismissed');
    if (hasDismissed) return;

    // Show popup after delay (10 seconds)
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('bzion-newsletter-dismissed', 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      // Replace with your actual newsletter API endpoint
      const response = await fetch('/api/newsletter-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in duration-300 overflow-hidden relative">
        {/* Close Button - Highly Visible */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 h-10 w-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
          aria-label="Close newsletter popup"
        >
          <X className="w-5 h-5 text-slate-700" />
        </button>

        {/* Content Container */}
        <div className="p-6">
          {/* Header */}
          <div className="mb-5 pr-10">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2">
              Stay Updated!
            </h2>
            <p className="text-sm md:text-base text-slate-600 leading-relaxed">
              Get exclusive deals, market insights, and product updates delivered to your inbox.
            </p>
          </div>

          {!isSubmitted ? (
            <>
              {/* Featured Image */}
              <div className="mb-5 rounded-xl overflow-hidden shadow-md bg-gradient-to-br from-primary/5 to-secondary/5">
                <Image
                  src="https://i.ibb.co/k2NHwMPJ/newsletterbanner.png"
                  alt="BZION Products"
                  width={400}
                  height={200}
                  className="w-full h-40 object-cover"
                  priority
                  unoptimized
                />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 mb-4">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
                />

                <Button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full rounded-xl h-11 font-bold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? 'Subscribing...' : 'Subscribe Now'}
                </Button>
              </form>

              {/* Disclaimer Text */}
              <p className="text-xs text-slate-500 leading-relaxed text-center">
                By subscribing, you agree to receive updates from BZION. Unsubscribe anytime. We respect your privacy.
              </p>
            </>
          ) : (
            /* Success Message */
            <div className="text-center py-8">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Successfully Subscribed!
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Thank you for subscribing. Check your email for confirmation!
              </p>
            </div>
          )}
        </div>

        {/* Footer Accent Bar */}
        <div className="h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
      </div>
    </div>
  );
};

export default NewsletterPopup;