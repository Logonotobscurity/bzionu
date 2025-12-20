import { prisma } from '@/lib/db';

export interface ActivityEvent {
  id: string;
  type: 'user_registration' | 'quote_request' | 'checkout' | 'newsletter_signup' | 'form_submission';
  timestamp: Date;
  actor: {
    id?: string;
    email: string;
    name?: string;
  };
  data: {
    reference?: string;
    amount?: number;
    items?: number;
    formType?: string;
    status?: string;
    message?: string;
  };
  status: string;
}

/**
 * Wrapper function to add timeout protection to async database queries
 * Increased timeout to 20 seconds to handle slow connections
 * Prevents hanging requests and ensures faster page loads
 */
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 20000,
  label: string = 'Query'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => {
        console.warn(`[TIMEOUT] ${label} exceeded ${timeoutMs}ms, returning empty data`);
        reject(new Error(`${label} timeout after ${timeoutMs}ms`));
      }, timeoutMs)
    ),
  ]);
}

export async function getRecentActivities(limit: number = 20): Promise<ActivityEvent[]> {
  try {
    // Get recent user registrations
    const newUsers = await withTimeout(
      prisma.user.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          emailVerified: true,
        },
      }),
      20000,
      'Fetch recent users'
    );

    // Get recent quote requests
    const quotes = await withTimeout(
      prisma.quote.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          reference: true,
          status: true,
          total: true,
          createdAt: true,
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          lines: {
            select: { id: true },
          },
        },
      }),
      20000,
      'Fetch recent quotes'
    );

    // Get recent form submissions
    const formSubmissions = await withTimeout(
      prisma.formSubmission.findMany({
        take: limit,
        orderBy: { submittedAt: 'desc' },
        select: {
          id: true,
          formType: true,
          data: true,
          submittedAt: true,
          status: true,
        },
      }),
      20000,
      'Fetch recent form submissions'
    );

    // Get recent newsletter signups
    const newsletterSignups = await withTimeout(
      prisma.newsletterSubscriber.findMany({
        take: limit,
        orderBy: { subscribedAt: 'desc' },
        select: {
          id: true,
          email: true,
          subscribedAt: true,
          status: true,
        },
      }),
      20000,
      'Fetch recent newsletter signups'
    );

    // Get recent checkout events (from analytics)
    const checkoutEvents = await withTimeout(
      prisma.analyticsEvent.findMany({
        where: {
          eventType: 'checkout_completed',
        },
        take: limit,
        orderBy: { timestamp: 'desc' },
        select: {
          id: true,
          data: true,
          timestamp: true,
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      20000,
      'Fetch recent checkout events'
    );

    // Convert all to unified activity format
    const activities: ActivityEvent[] = [];

    // Add user registrations
    activities.push(
      ...newUsers.map((user) => ({
        id: `user_${user.id}`,
        type: 'user_registration' as const,
        timestamp: user.createdAt,
        actor: {
          id: user.id.toString(),
          email: user.email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        },
        data: {
          message: `New registration from ${user.firstName || 'User'}`,
        },
        status: user.emailVerified ? 'verified' : 'pending_verification',
      }))
    );

    // Add quotes
    activities.push(
      ...quotes.map((quote) => ({
        id: quote.id,
        type: 'quote_request' as const,
        timestamp: quote.createdAt,
        actor: {
          email: quote.user?.email || 'unknown',
          name: quote.user ? `${quote.user.firstName || ''} ${quote.user.lastName || ''}`.trim() : 'Unknown',
        },
        data: {
          reference: quote.reference,
          amount: quote.total,
          items: quote.lines.length,
        },
        status: quote.status,
      }))
    );

    // Add form submissions
    activities.push(
      ...formSubmissions.map((submission) => ({
        id: submission.id,
        type: 'form_submission' as const,
        timestamp: submission.submittedAt,
        actor: {
          email: (submission.data as any)?.email || 'unknown@email.com',
          name: (submission.data as any)?.name || 'Unknown User',
        },
        data: {
          formType: submission.formType,
          message: `Form submission - ${submission.formType}`,
        },
        status: submission.status,
      }))
    );

    // Add newsletter signups
    activities.push(
      ...newsletterSignups.map((sub) => ({
        id: `newsletter_${sub.id}`,
        type: 'newsletter_signup' as const,
        timestamp: sub.subscribedAt,
        actor: {
          email: sub.email,
        },
        data: {
          message: 'Newsletter signup',
        },
        status: sub.status,
      }))
    );

    // Add checkout events
    activities.push(
      ...checkoutEvents.map((event) => ({
        id: event.id,
        type: 'checkout' as const,
        timestamp: event.timestamp,
        actor: {
          email: event.user?.email || 'unknown',
          name: event.user ? `${event.user.firstName || ''} ${event.user.lastName || ''}`.trim() : 'Unknown',
        },
        data: {
          amount: (event.data as any)?.orderTotal,
          reference: (event.data as any)?.orderId,
          message: 'Checkout completed',
        },
        status: 'completed',
      }))
    );

    // Sort by timestamp and return limit
    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
}

export async function getActivityStats() {
  try {
    const [
      totalUsers,
      newUsersThisWeek,
      totalQuotes,
      pendingQuotes,
      totalNewsletterSubscribers,
      totalFormSubmissions,
      totalCheckouts,
    ] = await withTimeout(
      Promise.all([
        prisma.user.count(),
        prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setDate(new Date().getDate() - 7)),
            },
          },
        }),
        prisma.quote.count(),
        prisma.quote.count({
          where: {
            status: { in: ['draft', 'pending'] },
          },
        }),
        prisma.newsletterSubscriber.count({
          where: { status: 'active' },
        }),
        prisma.formSubmission.count(),
        prisma.analyticsEvent.count({
          where: { eventType: 'checkout_completed' },
        }),
      ]),
      20000,
      'Fetch activity stats'
    );

    return {
      totalUsers,
      newUsersThisWeek,
      totalQuotes,
      pendingQuotes,
      totalNewsletterSubscribers,
      totalFormSubmissions,
      totalCheckouts,
    };
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    return {
      totalUsers: 0,
      newUsersThisWeek: 0,
      totalQuotes: 0,
      pendingQuotes: 0,
      totalNewsletterSubscribers: 0,
      totalFormSubmissions: 0,
      totalCheckouts: 0,
    };
  }
}

export async function getQuotes(status?: string, limit: number = 50) {
  try {
    const quotes = await withTimeout(
      prisma.quote.findMany({
        where: status ? { status } : undefined,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          reference: true,
          status: true,
          total: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
              companyName: true,
            },
          },
          lines: {
            select: { id: true },
          },
        },
      }),
      20000,
      'Fetch quotes'
    );
    return quotes;
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return [];
  }
}

export async function getNewUsers(limit: number = 50) {
  try {
    const users = await withTimeout(
      prisma.user.findMany({
        where: {
          role: 'customer',
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          companyName: true,
          phone: true,
          createdAt: true,
          lastLogin: true,
          emailVerified: true,
          isNewUser: true,
        },
      }),
      20000,
      'Fetch new users'
    );
    return users;
  } catch (error) {
    console.error('Error fetching new users:', error);
    return [];
  }
}

export async function getNewsletterSubscribers(limit: number = 50) {
  try {
    const subscribers = await withTimeout(
      prisma.newsletterSubscriber.findMany({
        take: limit,
        orderBy: { subscribedAt: 'desc' },
        select: {
          id: true,
          email: true,
          status: true,
          subscribedAt: true,
          unsubscribedAt: true,
        },
      }),
      20000,
      'Fetch newsletter subscribers'
    );
    return subscribers;
  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error);
    return [];
  }
}

export async function getFormSubmissions(limit: number = 50) {
  try {
    const submissions = await withTimeout(
      prisma.formSubmission.findMany({
        take: limit,
        orderBy: { submittedAt: 'desc' },
        select: {
          id: true,
          formType: true,
          data: true,
          submittedAt: true,
          status: true,
          ipAddress: true,
        },
      }),
      20000,
      'Fetch form submissions'
    );
    return submissions;
  } catch (error) {
    console.error('Error fetching form submissions:', error);
    return [];
  }
}

export async function updateFormSubmissionStatus(id: string, status: string) {
  try {
    const updated = await withTimeout(
      prisma.formSubmission.update({
        where: { id },
        data: { status },
      }),
      20000,
      'Update form submission status'
    );
    return updated;
  } catch (error) {
    console.error('Error updating form submission:', error);
    throw error;
  }
}
