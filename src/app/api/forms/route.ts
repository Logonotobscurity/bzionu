
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { formSubmissionSchema, contactFormSchema, newsletterFormSchema, quoteFormSchema } from '@/lib/validations/forms';
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

// Initialize rate limiter
// 5 requests from the same IP in 15 minutes
const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
});

export async function POST(req: NextRequest) {
  const ip = (req.headers.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0];

  try {
    // Apply rate limiting
    const { success, limit, remaining, reset } = await ratelimit.limit(ip);

    const headers = {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': reset.toString(),
    };

    if (!success) {
      return new Response('Too many submissions. Please try again later.', { 
        status: 429, 
        headers 
      });
    }

    const body = await req.json();

    // Validate against the general-purpose schema first
    const parsedBody = formSubmissionSchema.safeParse(body);
    if (!parsedBody.success) {
      return new Response(JSON.stringify({ message: 'Invalid request body', details: parsedBody.error.format() }), { status: 400, headers });
    }

    const { formType, data } = parsedBody.data;

    switch (formType) {
      case 'contact': {
        const parsedData = contactFormSchema.safeParse(data);
        if (!parsedData.success) {
          return new Response(JSON.stringify({ message: 'Invalid contact form data', details: parsedData.error.format() }), { status: 400, headers });
        }

        await prisma.formSubmission.create({
          data: {
            formType: 'contact',
            data: parsedData.data,
            ipAddress: ip,
            userAgent: req.headers.get('user-agent'),
          },
        });

        await prisma.lead.create({
          data: {
            email: parsedData.data.email,
            name: parsedData.data.name,
            companyName: parsedData.data.company,
            type: 'Website Inquiry',
            source: 'Contact Form',
            status: 'NEW',
          },
        });

        return new Response(JSON.stringify({ message: 'Form submitted successfully' }), { status: 201, headers });
      }

      case 'newsletter': {
        const parsedData = newsletterFormSchema.safeParse(data);
        if (!parsedData.success) {
          return new Response(JSON.stringify({ message: 'Invalid newsletter signup data', details: parsedData.error.format() }), { status: 400, headers });
        }
        
        try {
            await prisma.newsletterSubscriber.create({
              data: {
                email: parsedData.data.email,
                source: parsedData.data.source || 'Website Footer',
                status: 'SUBSCRIBED',
              },
            });
        } catch (error: any) {
            // Handle unique constraint violation for email
            if (error.code === 'P2002') {
                return new Response(JSON.stringify({ message: 'This email is already subscribed.' }), { status: 409, headers });
            }
            throw error; // Re-throw other errors
        }

        return new Response(JSON.stringify({ message: 'Successfully subscribed to the newsletter' }), { status: 201, headers });
      }

      case 'quote': {
        const parsedData = quoteFormSchema.safeParse(data);
        if (!parsedData.success) {
          return new Response(JSON.stringify({ message: 'Invalid quote request data', details: parsedData.error.format() }), { status: 400, headers });
        }

        const { email, name, companyName, phone, items } = parsedData.data;

        const newQuote = await prisma.$transaction(async (tx) => {
            let customer = await tx.customer.findUnique({
                where: { email },
            });

            if (!customer) {
                customer = await tx.customer.create({
                    data: {
                        email,
                        firstName: name,
                        companyName,
                        phone,
                        source: 'Quote Request Form',
                        customerType: 'PROSPECT',
                    }
                });
            } else {
                 customer = await tx.customer.update({
                     where: { email },
                     data: {
                         firstName: name || undefined,
                         companyName: companyName || undefined,
                         phone: phone || undefined,
                     }
                 });
            }

            await tx.formSubmission.create({
              data: {
                formType: 'quote',
                data: parsedData.data,
                ipAddress: ip,
                userAgent: req.headers.get('user-agent'),
              },
            });

            await tx.lead.create({
              data: {
                email: email,
                name: name,
                companyName: companyName,
                phone: phone,
                type: 'Website Quote Request',
                source: 'Quote Form',
                status: 'NEW',
              },
            });

            const quoteReference = `Q-${Date.now().toString().slice(-6)}`;
            const createdQuote = await tx.quote.create({
              data: {
                reference: quoteReference,
                status: 'draft',
                buyerContactEmail: email,
                buyerContactPhone: phone,
                customerId: customer.id,
                lines: {
                  create: items.map(item => ({
                    productName: item.name,
                    productSku: item.sku,
                    qty: item.quantity,
                  })),
                },
              },
            });

            return createdQuote;
        });

        return new Response(JSON.stringify({ message: 'Quote request submitted successfully', quoteId: newQuote.id }), { status: 201, headers });
      }

      default: {
        return new Response(JSON.stringify({ message: 'Invalid form type' }), { status: 400, headers });
      }
    }
  } catch (error) {
    console.error('[FORM_SUBMISSION_ERROR]', error);

    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ message: 'Validation error', details: error.format() }), { status: 400 });
    }

    return new Response('Internal Server Error', { status: 500 });
  }
}
