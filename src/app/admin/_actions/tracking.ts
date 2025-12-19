'use server';

import { prisma } from '@/lib/db';

export async function trackCheckoutEvent(data: {
  userId?: number;
  orderTotal: number;
  orderId: string;
  itemCount: number;
  email: string;
}) {
  try {
    await prisma.analyticsEvent.create({
      data: {
        eventType: 'checkout_completed',
        userId: data.userId,
        data: {
          orderTotal: data.orderTotal,
          orderId: data.orderId,
          itemCount: data.itemCount,
          email: data.email,
        },
        source: 'B2B_PLATFORM',
      },
    });
  } catch (error) {
    console.error('Error tracking checkout event:', error);
  }
}

export async function trackUserRegistration(data: {
  userId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
}) {
  try {
    await prisma.analyticsEvent.create({
      data: {
        eventType: 'user_registered',
        userId: data.userId,
        data: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          companyName: data.companyName,
        },
        source: 'B2B_PLATFORM',
      },
    });
  } catch (error) {
    console.error('Error tracking user registration:', error);
  }
}

export async function trackQuoteRequest(data: {
  quoteId: string;
  userId?: number;
  reference: string;
  email: string;
  itemCount: number;
  estimatedValue?: number;
}) {
  try {
    await prisma.analyticsEvent.create({
      data: {
        eventType: 'quote_requested',
        userId: data.userId,
        data: {
          quoteId: data.quoteId,
          reference: data.reference,
          email: data.email,
          itemCount: data.itemCount,
          estimatedValue: data.estimatedValue,
        },
        source: 'B2B_PLATFORM',
      },
    });
  } catch (error) {
    console.error('Error tracking quote request:', error);
  }
}

export async function trackNewsletterSignup(data: {
  email: string;
  source: string;
}) {
  try {
    // Create/update newsletter subscriber
    await prisma.newsletterSubscriber.upsert({
      where: { email: data.email },
      update: {
        status: 'active',
      },
      create: {
        email: data.email,
        source: data.source,
        status: 'active',
        metadata: {
          signupDate: new Date().toISOString(),
        },
      },
    });

    // Track event
    await prisma.analyticsEvent.create({
      data: {
        eventType: 'newsletter_signup',
        data: {
          email: data.email,
          source: data.source,
        },
        source: 'B2B_PLATFORM',
      },
    });
  } catch (error) {
    console.error('Error tracking newsletter signup:', error);
  }
}

export async function trackFormSubmission(data: {
  formType: string;
  email: string;
  name: string;
  message?: string;
  phone?: string;
  company?: string;
  subject?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    const submission = await prisma.formSubmission.create({
      data: {
        formType: data.formType,
        data: {
          email: data.email,
          name: data.name,
          message: data.message,
          phone: data.phone,
          company: data.company,
          subject: data.subject,
        },
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        status: 'new',
      },
    });

    // Track event
    await prisma.analyticsEvent.create({
      data: {
        eventType: 'form_submitted',
        data: {
          formSubmissionId: submission.id,
          formType: data.formType,
          email: data.email,
        },
        source: 'B2B_PLATFORM',
      },
    });

    return submission;
  } catch (error) {
    console.error('Error tracking form submission:', error);
    throw error;
  }
}

export async function trackProductView(data: {
  productId: number;
  userId?: number;
  ipAddress?: string;
}) {
  try {
    await prisma.productView.create({
      data: {
        productId: data.productId,
        userId: data.userId,
        ipAddress: data.ipAddress,
      },
    });

    await prisma.analyticsEvent.create({
      data: {
        eventType: 'product_viewed',
        userId: data.userId,
        data: {
          productId: data.productId,
        },
        source: 'B2B_PLATFORM',
      },
    });
  } catch (error) {
    console.error('Error tracking product view:', error);
  }
}

export async function trackSearchQuery(data: {
  query: string;
  userId?: number;
  resultCount: number;
}) {
  try {
    await prisma.searchQuery.create({
      data: {
        query: data.query,
        userId: data.userId,
        results: data.resultCount,
      },
    });

    await prisma.analyticsEvent.create({
      data: {
        eventType: 'search_performed',
        userId: data.userId,
        data: {
          query: data.query,
          resultCount: data.resultCount,
        },
        source: 'B2B_PLATFORM',
      },
    });
  } catch (error) {
    console.error('Error tracking search query:', error);
  }
}

// Notification tracking
export async function createNotification(data: {
  userId: number;
  type: string;
  message: string;
  link?: string;
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        message: data.message,
        link: data.link,
        isRead: false,
      },
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

export async function updateUserLastLogin(userId: number) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastLogin: new Date(),
        isNewUser: false,
      },
    });
  } catch (error) {
    console.error('Error updating last login:', error);
  }
}
