'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MetricsCards } from './MetricsCards';
import { ActivityFeed } from './ActivityFeed';
import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';
import { Eye, MessageSquare, Trash2, Download, RefreshCw, Clock } from 'lucide-react';
import type { ActivityEvent } from '../_actions/activities';

interface AdminDashboardProps {
  stats: {
    totalUsers: number;
    newUsersThisWeek: number;
    totalQuotes: number;
    pendingQuotes: number;
    totalNewsletterSubscribers: number;
    totalFormSubmissions: number;
    totalCheckouts: number;
  };
  activities: ActivityEvent[];
  quotes: any[];
  newUsers: any[];
  newsletterSubscribers: any[];
  formSubmissions: any[];
}

export default function AdminDashboardClient({
  stats: initialStats,
  activities: initialActivities,
  quotes: initialQuotes,
  newUsers: initialNewUsers,
  newsletterSubscribers: initialNewsletterSubscribers,
  formSubmissions: initialFormSubmissions,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('activity');
  const [stats, setStats] = useState(initialStats);
  const [activities, setActivities] = useState(initialActivities);
  const [quotes, setQuotes] = useState(initialQuotes);
  const [newUsers, setNewUsers] = useState(initialNewUsers);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState(initialNewsletterSubscribers);
  const [formSubmissions, setFormSubmissions] = useState(initialFormSubmissions);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  // Pagination state for each section
  const [activitiesPage, setActivitiesPage] = useState(0);
  const [quotesPage, setQuotesPage] = useState(0);
  const [usersPage, setUsersPage] = useState(0);
  const [newsletterPage, setNewsletterPage] = useState(0);
  const [formsPage, setFormsPage] = useState(0);

  // Refresh data from server
  const refreshData = useCallback(async (page: number = 0) => {
    try {
      setIsRefreshing(true);
      const limit = 20;
      const response = await fetch(`/api/admin/dashboard-data?page=${page}&limit=${limit}`, {
        headers: {
          'If-None-Match': lastUpdated.getTime().toString(),
        },
      });
      
      if (response.status === 304) {
        console.log('[DASHBOARD] Using cached data (304 Not Modified)');
        setLastUpdated(new Date());
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setActivities(data.activities);
        setQuotes(data.quotes);
        setNewUsers(data.newUsers);
        setNewsletterSubscribers(data.newsletterSubscribers);
        setFormSubmissions(data.formSubmissions);
        setLastUpdated(new Date());
        console.log(`[DASHBOARD] Data loaded in ${data.responseTime}`);
      }
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [lastUpdated]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(refreshData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh, refreshData]);

  // Initial load timestamp
  useEffect(() => {
    setLastUpdated(new Date());
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      'pending_verification': 'bg-yellow-100 text-yellow-800',
      negotiating: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800',
      verified: 'bg-green-100 text-green-800',
      active: 'bg-green-100 text-green-800',
      new: 'bg-blue-100 text-blue-800',
      read: 'bg-gray-100 text-gray-800',
      responded: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4 md:py-8 space-y-4 md:space-y-8">
        {/* Header with Refresh Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 rounded-lg">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last updated: {format(lastUpdated, 'MMM dd, yyyy HH:mm:ss')}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? 'default' : 'outline'}
              size="sm"
              className="w-full sm:w-auto"
            >
              {autoRefresh ? 'Auto-refreshing' : 'Auto-refresh off'}
            </Button>
            <Button
              onClick={() => refreshData()}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <MetricsCards stats={stats} />

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto bg-white rounded-lg">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 h-auto gap-1 p-1 bg-transparent">
              <TabsTrigger value="activity" className="text-xs sm:text-sm py-2">
                Activity
              </TabsTrigger>
              <TabsTrigger value="quotes" className="text-xs sm:text-sm py-2">
                Quotes
              </TabsTrigger>
              <TabsTrigger value="users" className="text-xs sm:text-sm py-2">
                Users
              </TabsTrigger>
              <TabsTrigger value="newsletter" className="text-xs sm:text-sm py-2">
                Letter
              </TabsTrigger>
              <TabsTrigger value="forms" className="text-xs sm:text-sm py-2">
                Forms
              </TabsTrigger>
              <TabsTrigger value="events" className="text-xs sm:text-sm py-2">
                Events
              </TabsTrigger>
            </TabsList>
          </div>

        {/* ACTIVITY TAB */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Real-time overview of all platform activities and events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityFeed activities={activities} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* QUOTES TAB */}
        <TabsContent value="quotes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle>Quote Requests</CardTitle>
                  <CardDescription>
                    Manage and track all customer quote requests
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{stats.totalQuotes} Total</Badge>
                  <Badge variant="destructive">{stats.pendingQuotes} Pending</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-6 px-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Reference</TableHead>
                      <TableHead className="whitespace-nowrap">Customer</TableHead>
                      <TableHead className="whitespace-nowrap text-center">Items</TableHead>
                      <TableHead className="whitespace-nowrap text-right">Total</TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                      <TableHead className="whitespace-nowrap">Created</TableHead>
                      <TableHead className="whitespace-nowrap text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotes.length > 0 ? (
                      quotes.map((quote) => (
                        <TableRow key={quote.id}>
                          <TableCell className="font-mono text-xs sm:text-sm">{quote.reference}</TableCell>
                          <TableCell className="min-w-[150px]">
                            <div>
                              <p className="font-medium text-sm">{quote.user?.firstName} {quote.user?.lastName}</p>
                              <p className="text-xs text-muted-foreground truncate">{quote.user?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-sm">{quote.lines.length}</TableCell>
                          <TableCell className="font-semibold text-sm text-right">
                            {quote.total ? `₦${(quote.total / 1000).toFixed(0)}K` : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(quote.status)} text-xs`}>
                              {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs whitespace-nowrap">
                            {formatDistanceToNow(new Date(quote.createdAt), { addSuffix: true })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="sm" title="View">
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" title="Message">
                                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No quotes yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NEW USERS TAB */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle>New Users</CardTitle>
                  <CardDescription>
                    Monitor user signups and onboarding status
                  </CardDescription>
                </div>
                <Badge>{stats.newUsersThisWeek} this week</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-6 px-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Name</TableHead>
                      <TableHead className="whitespace-nowrap">Email</TableHead>
                      <TableHead className="whitespace-nowrap">Company</TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                      <TableHead className="whitespace-nowrap">Joined</TableHead>
                      <TableHead className="whitespace-nowrap">Last Login</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {newUsers.length > 0 ? (
                      newUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium min-w-[120px] text-sm">
                            {user.firstName} {user.lastName}
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm min-w-[150px] truncate">
                            {user.email}
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">{user.companyName || '-'}</TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(user.emailVerified ? 'verified' : 'pending_verification')} text-xs`}>
                              {user.emailVerified ? '✓ Verified' : '◯ Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs whitespace-nowrap">
                            {format(new Date(user.createdAt), 'MMM dd')}
                          </TableCell>
                          <TableCell className="text-xs whitespace-nowrap">
                            {user.lastLogin
                              ? formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })
                              : 'Never'}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No new users
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NEWSLETTER TAB */}
        <TabsContent value="newsletter" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle>Newsletter Subscribers</CardTitle>
                  <CardDescription>
                    Manage your email subscribers
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <Download className="h-4 w-4 mr-2" />
                  Export List
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-6 px-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Email</TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                      <TableHead className="whitespace-nowrap">Subscribed</TableHead>
                      <TableHead className="whitespace-nowrap">Unsubscribed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {newsletterSubscribers.length > 0 ? (
                      newsletterSubscribers.map((sub) => (
                        <TableRow key={sub.id}>
                          <TableCell className="text-xs sm:text-sm min-w-[180px] truncate">
                            {sub.email}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(sub.status)} text-xs`}>
                              {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs whitespace-nowrap">
                            {format(new Date(sub.subscribedAt), 'MMM dd')}
                          </TableCell>
                          <TableCell className="text-xs whitespace-nowrap">
                            {sub.unsubscribedAt ? format(new Date(sub.unsubscribedAt), 'MMM dd') : '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No subscribers yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FORMS TAB */}
        <TabsContent value="forms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Form Submissions</CardTitle>
              <CardDescription>
                Track all form submissions from customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-6 px-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Form Type</TableHead>
                      <TableHead className="whitespace-nowrap">From</TableHead>
                      <TableHead className="whitespace-nowrap">Email</TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                      <TableHead className="whitespace-nowrap">Submitted</TableHead>
                      <TableHead className="whitespace-nowrap text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formSubmissions.length > 0 ? (
                      formSubmissions.map((submission) => {
                        const data = submission.data as any;
                        return (
                          <TableRow key={submission.id}>
                            <TableCell className="font-medium text-xs sm:text-sm whitespace-nowrap">
                              {submission.formType}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm min-w-[100px] truncate">
                              {data?.name || 'Unknown'}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm min-w-[140px] truncate">
                              {data?.email || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getStatusColor(submission.status)} text-xs`}>
                                {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs whitespace-nowrap">
                              {formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="sm" title="View">
                                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" title="Delete">
                                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No form submissions
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* EVENTS TAB */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Analytics</CardTitle>
              <CardDescription>
                System-wide event tracking and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <p>Analytics charts coming soon</p>
                <p className="text-sm">Event visualization dashboard will be available shortly</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
