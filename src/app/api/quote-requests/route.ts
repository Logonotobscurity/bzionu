
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateQuoteRequestWhatsAppURL } from '@/lib/api/whatsapp';
import { z } from 'zod';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY);

const quoteRequestSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  company: z.string().optional(),
  message: z.string(),
  items: z.array(z.object({
    id: z.string(),
    quantity: z.number(),
    name: z.string(),
  })),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const {
      name,
      email,
      phone,
      company,
      message,
      items,
    } = quoteRequestSchema.parse(json);

    // Try to create quote record in database (non-blocking)
    try {
      await prisma.quote.create({
        data: {
          reference: `QR-${Date.now()}`,
          buyerContactEmail: email,
          buyerContactPhone: phone,
          buyerCompanyId: company || null,
          status: 'draft',
          lines: {
            create: items.map(item => ({
              productId: item.id,
              productName: item.name,
              qty: item.quantity,
            })),
          },
        },
      });
    } catch (dbError) {
      console.warn('[QUOTE_DB_SAVE_WARNING]', dbError);
      // Don't fail the request if database save fails - user can still proceed with WhatsApp
    }

    // Generate WhatsApp URLs (non-blocking)
    try {
      generateQuoteRequestWhatsAppURL({
        name,
        email,
        phone,
        company,
        address: message,
        items: items.map(item => ({
          id: item.id || '',
          name: item.name || '',
          quantity: item.quantity || 0,
        })),
      });
    } catch (whatsappError) {
      console.warn('[WHATSAPP_NOTIFICATION_ERROR]', whatsappError);
      // Don't fail the request if WhatsApp notification fails
    }

    // Send acknowledgment email to customer (non-blocking)
    try {
      const itemsList = items.map((item, index) => 
        `${index + 1}. ${item.name} - Quantity: ${item.quantity}`
      ).join('\n');

      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'noreply@bzion.shop',
        to: email,
        subject: 'Quote Request Received - BZION',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #1a202c; margin-top: 0;">Quote Request Received</h2>
              <p style="color: #4a5568; font-size: 14px;">Thank you for your quote request, ${name}. We've received your inquiry and our team will review it shortly.</p>
            </div>

            <div style="background-color: #fff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #1a202c; font-size: 16px; margin-top: 0;">Request Details</h3>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #4a5568;">Contact Information:</strong>
                <p style="margin: 5px 0; color: #4a5568; font-size: 14px;">
                  Name: ${name}<br/>
                  Email: ${email}<br/>
                  Phone: ${phone}<br/>
                  ${company ? `Company: ${company}<br/>` : ''}
                  Address: ${message}
                </p>
              </div>

              <div style="margin-bottom: 15px;">
                <strong style="color: #4a5568;">Requested Items:</strong>
                <p style="margin: 5px 0; color: #4a5568; font-size: 14px; white-space: pre-line;">${itemsList}</p>
              </div>

              <div style="background-color: #f0fdf4; padding: 10px; border-left: 4px solid #22c55e; border-radius: 4px;">
                <p style="margin: 0; color: #166534; font-size: 14px;"><strong>Total Items:</strong> ${items.reduce((sum, item) => sum + item.quantity, 0)}</p>
              </div>
            </div>

            <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0; color: #0369a1; font-size: 14px;">
                <strong>What's Next?</strong><br/>
                Our sales team will reach out to you within 24 hours with pricing and availability details. You'll also receive a message on WhatsApp for quick communication.
              </p>
            </div>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
              <p style="color: #718096; font-size: 12px; margin: 0;">
                © 2025 BZION. All rights reserved.<br/>
                <a href="https://bzion.shop" style="color: #2563eb; text-decoration: none;">Visit our website</a>
              </p>
            </div>
          </div>
        `,
      });
      console.log('[ACKNOWLEDGMENT_EMAIL_SENT]', { email, name });
    } catch (emailError) {
      console.warn('[ACKNOWLEDGMENT_EMAIL_ERROR]', emailError);
      // Don't fail the request if email fails - quote request still submitted
    }

    // Return success response - user is redirected to WhatsApp on client side
    return NextResponse.json({
      success: true,
      message: 'Quote request submitted successfully.'
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[QUOTE_REQUESTS_VALIDATION_ERROR]', error.errors);
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('[QUOTE_REQUESTS_POST]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const quoteRequests = await prisma.quote.findMany({
      include: {
        lines: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(quoteRequests);
  } catch (error) {
    console.error('[QUOTE_REQUESTS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

