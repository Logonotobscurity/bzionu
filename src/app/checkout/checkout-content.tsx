'use client';

import { useQuoteStore, type QuoteItem } from '@/lib/store/quote';
import { Button } from '@/components/ui/button';
import { Section } from '@/components/ui/section';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatedDiv } from '@/components/animated-div';
import { CTASection } from '@/components/cta-section';
import { Package, Truck, Shield, CheckCircle, User, FileText, Tag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const checkoutSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  company: z.string().optional(),
  address: z.string().min(1, { message: 'Address is required.' }),
  city: z.string().min(1, { message: 'City is required.' }),
  state: z.string().min(1, { message: 'State is required.' }),
  phone: z.string().min(1, { message: 'Phone number is required.' }),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

type CheckoutStep = 'Review' | 'Details' | 'Submit';

const CheckoutProgress = ({ currentStep }: { currentStep: CheckoutStep }) => {
    const steps: {name: CheckoutStep, icon: React.ElementType}[] = [
        { name: 'Review', icon: FileText },
        { name: 'Details', icon: User },
        { name: 'Submit', icon: CheckCircle },
    ];

    const currentStepIndex = steps.findIndex(step => step.name === currentStep);

    return (
        <div className="w-full max-w-3xl mx-auto mb-8 md:mb-12">
            <div className="flex items-center justify-between relative">
                {steps.map((step, index) => {
                    const isActive = index === currentStepIndex;
                    const isCompleted = index < currentStepIndex;
                    const Icon = step.icon;

                    return (
                        <div key={step.name} className="flex flex-col items-center gap-2 md:gap-3 relative z-10">
                           <div className={cn(
                               "w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                               isActive ? "bg-gradient-to-br from-primary to-primary/80 text-white border-primary scale-110 shadow-lg shadow-primary/40" : 
                               isCompleted ? "bg-gradient-to-br from-green-500 to-green-600 text-white border-green-500 shadow-md" : "bg-white text-slate-400 border-slate-300"
                           )}>
                               <Icon className="w-5 h-5 md:w-6 md:h-6" />
                           </div>
                           <p className={cn(
                               "text-xs md:text-sm font-bold transition-colors duration-300 text-center",
                               isActive ? "text-primary" : isCompleted ? "text-green-600" : "text-slate-500"
                           )}>
                               {step.name}
                           </p>
                           {index < steps.length - 1 && (
                                <div className={cn(
                                    "absolute top-5 md:top-7 left-1/2 h-0.5 transition-all duration-300",
                                    isCompleted ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-slate-300'
                                )} style={{ width: 'calc(100vw / 3 - 3rem)', transform: 'translateX(0)' }}/>
                           )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default function CheckoutContent() {
  const [step, setStep] = useState<CheckoutStep>('Review');
  const { items, clearQuote } = useQuoteStore((state) => ({
    items: state.items as QuoteItem[],
    clearQuote: state.clearQuote,
  }));
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [requestedBrand, setRequestedBrand] = useState<string | null>(null);

  useEffect(() => {
    const brand = searchParams.get('brand');
    if (brand) {
      setRequestedBrand(decodeURIComponent(brand));
    }
  }, [searchParams]);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      company: '',
      address: '',
      city: '',
      state: '',
      phone: '',
    }
  });

  useEffect(() => {
    const savedData = localStorage.getItem('checkoutForm');
    if (savedData) {
      form.reset(JSON.parse(savedData));
    }
  }, [form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem('checkoutForm', JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const { formState: { isSubmitting, isValid } } = form;

  const handleWhatsAppSubmit = (data: CheckoutFormValues) => {
    if (items.length === 0) return;

    // Create organized message with customer details
    const messageLines = [
      "🛍️ *BZION Quote Request*",
      "",
      "*Customer Details:*",
      `Name: ${data.firstName} ${data.lastName}`,
      `Email: ${data.email}`,
      `Phone: ${data.phone}`,
      `Company: ${data.company || "N/A"}`,
      `Address: ${data.address}, ${data.city}, ${data.state}`,
      "",
      "*Items Requested:*"
    ];

    items.forEach((item, index) => {
      messageLines.push(`${index + 1}. ${item.name}`);
      messageLines.push(`   SKU: ${item.sku || item.id}`);
      messageLines.push(`   Quantity: ${item.quantity}`);
    });

    messageLines.push("");
    messageLines.push(`*Total Items: ${items.reduce((sum, item) => sum + item.quantity, 0)}*`);
    messageLines.push("");
    messageLines.push("Please confirm availability and provide pricing details.");

    const message = messageLines.join("\n");
    const encodedMessage = encodeURIComponent(message);
    // Use the WhatsApp Business API URL for quote requests
    const whatsappApiUrl = process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_URL || 'https://api.whatsapp.com/message/TOVLTP6EMAWNI1';
    const whatsappUrl = `${whatsappApiUrl}?text=${encodedMessage}`;

    // Open WhatsApp with responsive handling
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent.toLowerCase();
      const isAndroid = userAgent.includes('android');
      const isIOS = /iphone|ipad|ipod/.test(userAgent);

      if (isAndroid || isIOS) {
        // Mobile: Use wa.me link which opens WhatsApp directly
        window.location.href = whatsappUrl;
      } else {
        // Desktop: Open in new tab
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      }
    }
  };

  const onSubmit = async (data: CheckoutFormValues) => {
    const message = `Address: ${data.address}, ${data.city}, ${data.state}`;
    const name = `${data.firstName} ${data.lastName}`;

    try {
      // Prepare items data ensuring all required fields are present
      const itemsData = items.map(item => ({
        id: String(item.id),
        quantity: item.quantity,
        name: item.name,
      }));

      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        company: data.company || '',
        address: data.address,
        city: data.city,
        state: data.state,
        name,
        message,
        items: itemsData,
      };

      // Submit to API for logging
      try {
        const response = await fetch('/api/quote-requests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          console.warn('API submission warning:', response.status);
          // Continue anyway - don't fail on API error
        }
      } catch (apiError) {
        console.warn('API submission error:', apiError);
        // Continue anyway - WhatsApp submission is more important
      }

      // Show success step
      setStep('Submit');

      toast({
        title: 'Quote Request Submitted!',
        description: 'Redirecting to WhatsApp...',
      });

      // Send to WhatsApp after a brief delay
      setTimeout(() => {
        handleWhatsAppSubmit(data);
      }, 500);
      
      // Clear quote and redirect after a longer delay
      setTimeout(() => {
        clearQuote();
        localStorage.removeItem('checkoutForm');
        router.push('/');
      }, 4000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Submission Error:', errorMessage);
      toast({
        title: 'Submission Error',
        description: errorMessage || 'There was a problem submitting your request. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <main className="flex-grow bg-gradient-to-b from-slate-50 via-white to-slate-50 min-h-screen">
      <Section className="py-8 md:py-16">
        <div className="mb-10 md:mb-16 text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-3 md:mb-4">Complete Your Quote</h1>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">Review your items and provide your delivery details to get started</p>
        </div>

        <CheckoutProgress currentStep={step} />

        <div className="max-w-5xl mx-auto">
            {step === 'Review' && (
                 <div className="space-y-6">
                 {/* Brand Info Card - if coming from brand page */}
                 {requestedBrand && (
                    <Card className="shadow-md border-2 border-secondary/30 rounded-2xl overflow-hidden bg-gradient-to-r from-secondary/5 to-secondary/10">
                        <CardContent className="p-4 md:p-6 flex items-center gap-3 md:gap-4">
                            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                              <Tag className="h-5 w-5 md:h-6 md:w-6 text-secondary" />
                            </div>
                            <div>
                              <p className="text-xs md:text-sm text-slate-600">Requesting Quote for Brand:</p>
                              <p className="text-base md:text-lg font-bold text-slate-900 capitalize">{requestedBrand}</p>
                            </div>
                        </CardContent>
                    </Card>
                 )}
                 
                 {/* Summary Card */}
                 <Card className="shadow-lg border-2 border-slate-200 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 border-b-2 border-slate-200 p-6 md:p-8">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl md:text-2xl font-bold">Quote Summary</CardTitle>
                          <div className="px-4 py-2 rounded-full bg-gradient-to-r from-primary to-primary/90 text-white font-bold text-sm shadow-md">{items.length} {items.length === 1 ? 'item' : 'items'}</div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8">
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                            {items.length > 0 ? (
                                items.map((item) => {
                                    return (
                                        <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-200 hover:shadow-md transition-shadow">
                                            <div className="relative w-16 h-16 md:w-20 md:h-20 bg-white border-2 border-slate-200 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center shadow-sm">
                                                <Image src={item.imageUrl || '/images/placeholder.jpg'} alt={item.name} fill className="object-contain p-2" sizes="80px" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-900 text-sm md:text-base line-clamp-2 mb-2">{item.name}</p>
                                                <div className="flex items-center gap-2">
                                                  <span className="text-xs text-slate-600">Quantity:</span>
                                                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs">{item.quantity}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <p className="text-sm text-slate-500 text-center py-12">Your quote request is empty.</p>
                            )}
                        </div>
    
                        {/* Benefits */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-6 border-t-2 border-slate-200 mt-6">
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-200">
                            <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                              <Truck className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xs md:text-sm font-bold text-slate-700">Fast Delivery</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                              <Shield className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xs md:text-sm font-bold text-slate-700">Quality Assured</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                            <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                              <CheckCircle className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xs md:text-sm font-bold text-slate-700">Best Pricing</span>
                          </div>
                        </div>
                    </CardContent>
                 </Card>
    
                 {/* Action Buttons */}
                 <div className="flex flex-col sm:flex-row gap-4">
                   {/* Browse Brand Items Button - Only show if coming from brand page */}
                   {requestedBrand && (
                     <Button 
                       variant="outline" 
                       size="lg" 
                       className="rounded-2xl text-base font-bold h-12 px-8 border-2 border-secondary text-secondary hover:bg-secondary/10 transition-all duration-200"
                       onClick={() => {
                         const brandSlug = requestedBrand.toLowerCase().replace(/\s+/g, '-');
                         router.push(`/products/brand/${brandSlug}`);
                       }}
                     >
                       ← Browse {requestedBrand} Items
                     </Button>
                   )}
                   
                   {/* Proceed Button */}
                   <Button 
                     onClick={() => setStep('Details')} 
                     size="lg" 
                     className={`rounded-2xl bg-gradient-to-r from-primary to-primary/90 text-white text-base font-bold h-12 px-8 shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-slate-400 transition-all duration-200 ${requestedBrand ? 'flex-1' : 'w-full'}`}
                     disabled={items.length === 0}
                   >
                     Proceed to Details →
                   </Button>
                 </div>
                 </div>
            )}

          {step === 'Details' && (
          <div className="space-y-6">
            <Card className="shadow-lg border-2 border-slate-200 rounded-2xl overflow-hidden">
              <Form {...form}>
                <form id="checkout-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
                  {/* Contact Information Section */}
                  <CardHeader className="bg-gradient-to-r from-blue-50 via-blue-50/50 to-transparent border-b-2 border-slate-200 p-5 md:p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                        <User className="h-6 w-6 md:h-7 md:w-7 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg md:text-2xl font-bold mb-1">Contact Information</CardTitle>
                        <p className="text-sm text-slate-600">How we'll reach you about your order</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 p-5 md:p-6">
                    <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="font-bold text-slate-900 text-base">Email Address</FormLabel>
                        <FormControl>
                            <Input placeholder="you@company.com" className="rounded-xl border-2 border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 text-base" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                  </CardContent>

                  {/* Business Information Section */}
                  <CardHeader className="bg-gradient-to-r from-green-50 via-green-50/50 to-transparent border-t-2 border-b-2 border-slate-200 p-5 md:p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0 shadow-md">
                        <Package className="h-6 w-6 md:h-7 md:w-7 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg md:text-2xl font-bold mb-1">Delivery Information</CardTitle>
                        <p className="text-sm text-slate-600">Where we'll send your products</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 p-5 md:p-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                        <FormField control={form.control} name="firstName" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-bold text-slate-900 text-base">First Name</FormLabel>
                                <FormControl><Input className="rounded-xl border-2 border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 text-base" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="lastName" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-bold text-slate-900 text-base">Last Name</FormLabel>
                                <FormControl><Input className="rounded-xl border-2 border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 text-base" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                     <FormField control={form.control} name="company" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-bold text-slate-900 text-base">Company Name <span className="text-slate-500 font-normal">(optional)</span></FormLabel>
                            <FormControl><Input className="rounded-xl border-2 border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 text-base" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                     )} />
                    <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-bold text-slate-900 text-base">Street Address</FormLabel>
                            <FormControl><Input className="rounded-xl border-2 border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 text-base" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <div className="grid sm:grid-cols-2 gap-6">
                         <FormField control={form.control} name="city" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-bold text-slate-900 text-base">City</FormLabel>
                                <FormControl><Input className="rounded-xl border-2 border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 text-base" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="state" render={({ field }) => (
                             <FormItem>
                                <FormLabel className="font-bold text-slate-900 text-base">State/Region</FormLabel>
                                <FormControl><Input className="rounded-xl border-2 border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 text-base" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                         )} />
                    </div>
                     <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-bold text-slate-900 text-base">Phone Number</FormLabel>
                            <FormControl><Input className="rounded-xl border-2 border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 text-base" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                     )} />
                </CardContent>
                </form>
              </Form>
            </Card>
             <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <Button onClick={() => setStep('Review')} variant="outline" size="lg" className="rounded-2xl border-2 font-bold h-12 px-8 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 sm:w-auto w-full">← Back to Review</Button>
                <Button type="submit" form="checkout-form" size="lg" className="flex-1 sm:max-w-md rounded-2xl bg-gradient-to-r from-primary to-primary/90 text-white text-base font-bold h-12 px-8 shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-slate-400 transition-all duration-200" disabled={isSubmitting || !isValid || items.length === 0}>
                    {isSubmitting ? 'Submitting...' : '📱 Submit & Send to WhatsApp'}
                </Button>
            </div>
          </div>
        )}

        {step === 'Submit' && (
            <div className="text-center py-20">
                <AnimatedDiv>
                    <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-2xl mb-6">
                      <CheckCircle className="h-14 w-14 text-white" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Quote Request Sent!</h2>
                    <p className="text-lg text-slate-600 max-w-md mx-auto">You will be redirected to WhatsApp to confirm your request.</p>
                </AnimatedDiv>
            </div>
        )}
        </div>

        {step !== 'Submit' && (
          <div className="mt-16">
            <CTASection
              title="Need Help with Your Order?"
              description="Our team is ready to assist you with product selection, bulk pricing, and delivery options. Get in touch for personalized support."
              ctaText="Contact Support"
              ctaHref="/contact"
              variant="default"
            />
          </div>
        )}
      </Section>
    </main>
  );
}
