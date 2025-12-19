'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { newsletterFormSchema } from '@/lib/validations/forms';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

type NewsletterFormValues = z.infer<typeof newsletterFormSchema>;

export function NewsletterForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterFormSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: NewsletterFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formType: 'newsletter', data: { ...data, source: 'Footer Signup' } }),
      });

      if (response.status === 201) {
        toast({
          title: 'Subscribed!',
          description: 'Thanks for signing up for our newsletter.',
        });
        form.reset();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Subscription Failed',
          description: errorData.message || 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Network Error',
        description: 'Could not connect to the server. Please check your connection.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormLabel className="sr-only">Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Your email address..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </form>
    </Form>
  );
}
