import { prisma } from '@/lib/db';

export type ActivityType = 
  | 'login' 
  | 'logout' 
  | 'quote_request' 
  | 'checkout' 
  | 'profile_update' 
  | 'password_reset'
  | 'email_verified'
  | 'account_created'
  | 'email_sent';

export interface ActivityData {
  [key: string]: any;
}

/**
 * Logs a user activity to the analytics_events table
 */
export async function logActivity(
  userId: number,
  eventType: ActivityType,
  data: ActivityData = {}
) {
  try {
    await prisma.analyticsEvent.create({
      data: {
        eventType,
        userId,
        sessionId: undefined,
        timestamp: new Date(),
        data: {
          ...data,
          timestamp: new Date().toISOString(),
        },
        source: 'B2B_PLATFORM',
      },
    });
  } catch (error) {
    console.error(`Failed to log activity ${eventType} for user ${userId}:`, error);
    // Don't throw - activity logging should not break the main flow
  }
}

/**
 * Gets recent activities for a user
 */
export async function getUserActivities(userId: number, limit: number = 10) {
  try {
    const activities = await prisma.analyticsEvent.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      select: {
        id: true,
        eventType: true,
        timestamp: true,
        data: true,
      },
    });
    return activities;
  } catch (error) {
    console.error(`Failed to fetch activities for user ${userId}:`, error);
    return [];
  }
}

/**
 * Gets activity summary for a user
 */
export async function getActivitySummary(userId: number) {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const [totalLogins, recentLogins, quoteRequests, checkouts] = await Promise.all([
      prisma.analyticsEvent.count({
        where: { userId, eventType: 'login' },
      }),
      prisma.analyticsEvent.count({
        where: { userId, eventType: 'login', timestamp: { gte: thirtyDaysAgo } },
      }),
      prisma.analyticsEvent.count({
        where: { userId, eventType: 'quote_request', timestamp: { gte: ninetyDaysAgo } },
      }),
      prisma.analyticsEvent.count({
        where: { userId, eventType: 'checkout', timestamp: { gte: ninetyDaysAgo } },
      }),
    ]);

    return {
      totalLogins,
      recentLogins,
      quoteRequests,
      checkouts,
    };
  } catch (error) {
    console.error(`Failed to fetch activity summary for user ${userId}:`, error);
    return {
      totalLogins: 0,
      recentLogins: 0,
      quoteRequests: 0,
      checkouts: 0,
    };
  }
}
