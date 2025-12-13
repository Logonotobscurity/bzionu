import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createQuote } from '@/services/quoteService';
import { sendEmail } from '@/lib/api/email';
import { sendQuoteRequestToWhatsApp } from '@/lib/api/whatsapp';
import RfqSubmissionEmail from '@/components/emails/rfq-submission-email';
import { checkRateLimit } from '@/lib/ratelimit';

// Prevent this route from being statically exported during build
export const dynamic = 'force-dynamic';

const rfqSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  company: z.string().optional(),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
    })
  ).min(1, 'At least one item is required'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validated = rfqSchema.parse(body);

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const { success, headers } = await checkRateLimit(ip, 'rfq');
    
    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please try again later.' },
        { status: 429, headers }
      );
    }

    // Create quote in database
    const quote = await createQuote({
      buyerContactEmail: validated.email,
      buyerContactPhone: validated.phone,
      buyerCompanyId: validated.company,
      lines: validated.items.map(item => ({
        productId: item.id,
        productName: item.name,
        qty: item.quantity,
      })),
    });

    // Send confirmation email
    try {
      const emailItems = validated.items.map(item => ({
        name: item.name || '',
        quantity: item.quantity || 0,
      }));
      
      await sendEmail({
        to: validated.email,
        subject: `BZION RFQ Confirmation: ${quote.reference}`,
        react: <RfqSubmissionEmail
          fullName={validated.fullName}
          quoteReference={quote.reference}
          items={emailItems}
        />,
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    // Send WhatsApp notification
    const whatsappData = {
      name: validated.fullName,
      email: validated.email,
      phone: validated.phone,
      company: validated.company,
      address: validated.address,
      items: validated.items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
      })),
    };

    const { success: whatsappSuccess, whatsappUrl, error: whatsappError } = await sendQuoteRequestToWhatsApp(whatsappData);

    if (whatsappError) {
      console.error('WhatsApp notification failed:', whatsappError);
    }

    return NextResponse.json({
      success: true,
      message: 'RFQ submitted successfully.',
      quoteReference: quote.reference,
      whatsappUrl: whatsappSuccess ? whatsappUrl : null,
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid input data',
        errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
      }, { status: 400 });
    }

    console.error('RFQ submission error:', error);
    return NextResponse.json({
      success: false,
      message: 'An unexpected error occurred while submitting the RFQ.',
    }, { status: 500 });
  }
}
