'use client';

import { Section, SectionHeading, SectionTitle, SectionDescription } from "@/components/ui/section";
import { Mail, Phone, MapPin } from 'lucide-react';
import Image from "next/image";
import Link from "next/link";
import { findImage } from "@/lib/placeholder-images";
import { ContactForm } from "@/components/forms/contact-form"; // Import the new contact form
import { Button } from "@/components/ui/button";

const PageHero = () => {
    return (
        <Section className="bg-primary">
            <div className="container-constrained">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="w-1/4 h-0.5 bg-accent mx-auto mb-6"></div>
                    <p className="text-sm font-bold tracking-widest text-secondary uppercase mb-4">
                        Contact Us
                    </p>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6">Get in Touch with BZION</h1>
                    <p className="text-lg text-slate-300 mb-8">We're here to help. Whether you're a potential partner, a customer with a question, or just want to learn more about our services, we'd love to hear from you.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild size="lg" variant="secondary">
                            <Link href="/careers">View Open Positions</Link>
                        </Button>
                        <Button asChild size="lg" variant="secondary">
                            <Link href="/contact">Become a Partner</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </Section>
    );
}

const ContactFormSection = () => {
    return (
        <Section className="bg-gradient-to-b from-secondary/5 to-background">
            <div className="max-w-2xl mx-auto">
                <SectionHeading className="text-center">
                    <SectionTitle>Send us a Message</SectionTitle>
                    <SectionDescription>Fill out the form below and we'll get back to you as soon as possible.</SectionDescription>
                </SectionHeading>
                
                <div className="relative mt-8 p-8 md:p-12 rounded-3xl bg-gradient-to-br from-white via-slate-50 to-white border border-slate-200/50 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                    {/* Modern gradient accent */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-secondary/5 to-transparent rounded-full -mr-48 -mt-48 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-primary/5 to-transparent rounded-full -ml-40 -mb-40 pointer-events-none"></div>
                    
                    <ContactForm />
                </div>
            </div>
        </Section>
    );
}

const ContactDetails = () => {
    const hqImage = findImage('contact-hq');
    return (
        <Section>
            <div className="grid lg:grid-cols-2 gap-12 items-start">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl p-2 bg-white">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:1rem_1rem] rounded-2xl"></div>
                    <Image 
                        src="https://i.ibb.co/cKcvzJrL/traceability-map.png"
                        alt={hqImage.description || ''}
                        fill
                        className="relative object-cover rounded-xl"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        data-ai-hint={hqImage.imageHint}
                        unoptimized
                    />
                </div>
                <div className="space-y-10">
                    <div>
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-6">Global Headquarters</h2>
                        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <MapPin className="h-5 w-5 text-secondary" />
                                <h3 className="font-semibold text-primary">Ogun State</h3>
                            </div>
                            <p className="text-slate-600 pl-8 mb-2">9 Ali Isiba, Street, Ota 112104, Ogun State (opposite matrix filling station, beside stanbic IBTC bank)</p>
                            <a href="tel:+2347010326015" className="text-slate-600 hover:text-primary pl-8 flex items-center gap-2 transition-colors"><Phone className="h-4 w-4"/>+234 701 032 6015</a>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-6">Strategic Branches</h2>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <MapPin className="h-5 w-5 text-secondary" />
                                    <h3 className="font-semibold text-primary">Temidire</h3>
                                </div>
                                <p className="text-slate-600 pl-8 mb-2">Kilometer 28 Lagos Abeokuta expressway Sango ota</p>
                                <a href="tel:+2347010326015" className="text-slate-600 hover:text-primary pl-8 flex items-center gap-2 transition-colors"><Phone className="h-4 w-4"/>+234 701 032 6015</a>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <MapPin className="h-5 w-5 text-secondary" />
                                    <h3 className="font-semibold text-primary">Singer</h3>
                                </div>
                                <p className="text-slate-600 pl-8 mb-2">Km 38, Lagos Abeokuta Exp. Way Singer bus stop</p>
                                <a href="tel:+2347010326015" className="text-slate-600 hover:text-primary pl-8 flex items-center gap-2 transition-colors"><Phone className="h-4 w-4"/>+234 701 032 6015</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-20">
                <SectionHeading>
                    <SectionTitle>Email Us</SectionTitle>
                </SectionHeading>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <Mail className="h-5 w-5 text-secondary"/>
                            <h3 className="font-semibold text-primary">Customer Care</h3>
                        </div>
                         <a href="mailto:customercare@bzion.shop" className="text-slate-600 hover:text-primary pl-8 block transition-colors">customercare@bzion.shop</a>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <Mail className="h-5 w-5 text-secondary"/>
                            <h3 className="font-semibold text-primary">Sales Inquiries</h3>
                        </div>
                        <a href="mailto:sales@bzion.shop" className="text-slate-600 hover:text-primary pl-8 block transition-colors">sales@bzion.shop</a>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <Mail className="h-5 w-5 text-secondary"/>
                            <h3 className="font-semibold text-primary">General Information</h3>
                        </div>
                        <a href="mailto:info@bzion.shop" className="text-slate-600 hover:text-primary pl-8 block transition-colors">info@bzion.shop</a>
                    </div>
                </div>
            </div>
        </Section>
    );
}

export default function ContactPage() {
    return (
        <>
            <PageHero />
            <div className="border-b-2 border-slate-200"></div>
            <ContactDetails />
            <ContactFormSection />
        </>
    )
}
