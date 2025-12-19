import { z } from 'zod';

// Schema for basic contact form
export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  company: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

// Schema for newsletter signup form
export const newsletterFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  source: z.string().optional(),
});

// Schema for quote request form
export const quoteFormSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Invalid email address'),
  companyName: z.string().optional(),
  phone: z.string().optional(),
  items: z.array(z.object({
    productId: z.union([z.string(), z.number()]),
    sku: z.string(),
    name: z.string(),
    quantity: z.number().min(1),
  })).min(1, 'Quote must contain at least one item'),
});

// General-purpose form submission schema
export const formSubmissionSchema = z.object({
  formType: z.enum(['contact', 'newsletter', 'quote', 'custom']),
  data: z.record(z.any()),
});
