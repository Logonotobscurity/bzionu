/**
 * Email Request Validation Schemas
 * Uses Zod for runtime type validation and parsing
 */

import { z } from 'zod';

/**
 * Schema for general email sending requests
 * Used by user/send-email and other email endpoints
 */
export const sendEmailSchema = z.object({
  to: z
    .string()
    .min(1, 'Recipient email is required')
    .email('Invalid recipient email format')
    .max(254, 'Email address is too long'),
  
  subject: z
    .string()
    .min(3, 'Subject must be at least 3 characters')
    .max(200, 'Subject cannot exceed 200 characters')
    .trim(),
  
  message: z
    .string()
    .min(3, 'Message must be at least 3 characters')
    .max(50000, 'Message cannot exceed 50KB')
    .trim()
    .optional(),
  
  html: z
    .string()
    .max(50000, 'HTML content cannot exceed 50KB')
    .optional(),
  
  attachments: z
    .array(
      z.object({
        filename: z
          .string()
          .min(1, 'Attachment filename is required')
          .max(255, 'Filename too long'),
        content: z.string().min(1, 'Attachment content is required'),
      })
    )
    .max(10, 'Cannot attach more than 10 files')
    .optional(),
});

export type SendEmailRequest = z.infer<typeof sendEmailSchema>;

/**
 * Schema for user-to-user contact/message emails
 */
export const userContactSchema = z.object({
  to: z
    .string()
    .min(1, 'Recipient email is required')
    .email('Invalid recipient email format')
    .max(254, 'Email address is too long'),
  
  senderName: z
    .string()
    .min(2, 'Sender name must be at least 2 characters')
    .max(100, 'Sender name too long')
    .trim()
    .optional(),
  
  senderEmail: z
    .string()
    .email('Invalid sender email format')
    .max(254, 'Email address is too long')
    .optional(),
  
  subject: z
    .string()
    .min(3, 'Subject must be at least 3 characters')
    .max(200, 'Subject too long')
    .trim(),
  
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(10000, 'Message cannot exceed 10KB')
    .trim(),
  
  category: z
    .enum(['general', 'support', 'business', 'feedback', 'other'])
    .optional(),
});

export type UserContactRequest = z.infer<typeof userContactSchema>;

/**
 * Schema for bulk email operations (admin only)
 */
export const bulkEmailSchema = z.object({
  recipients: z
    .array(
      z
        .string()
        .email('Invalid email format in recipients list')
        .max(254, 'Email too long')
    )
    .min(1, 'At least one recipient is required')
    .max(1000, 'Cannot send to more than 1000 recipients at once'),
  
  subject: z
    .string()
    .min(3, 'Subject required')
    .max(200, 'Subject too long')
    .trim(),
  
  message: z
    .string()
    .min(3, 'Message required')
    .max(50000, 'Message too large')
    .trim()
    .optional(),
  
  html: z
    .string()
    .max(50000, 'HTML content too large')
    .optional(),
  
  tags: z
    .array(z.string().max(50))
    .max(10, 'Cannot add more than 10 tags')
    .optional(),
});

export type BulkEmailRequest = z.infer<typeof bulkEmailSchema>;

/**
 * Schema for newsletter subscription
 */
export const newsletterSubscribeSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(254, 'Email too long'),
  
  firstName: z
    .string()
    .max(100, 'First name too long')
    .trim()
    .optional(),
  
  lastName: z
    .string()
    .max(100, 'Last name too long')
    .trim()
    .optional(),
  
  interests: z
    .array(z.string())
    .max(10, 'Cannot select more than 10 interests')
    .optional(),
  
  consent: z
    .boolean()
    .refine(val => val === true, 'You must consent to receive newsletters'),
});

export type NewsletterSubscribeRequest = z.infer<typeof newsletterSubscribeSchema>;

/**
 * Schema for admin email test/verification
 */
export const emailTestSchema = z.object({
  to: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(254, 'Email too long'),
  
  adminToken: z
    .string()
    .optional(),
});

export type EmailTestRequest = z.infer<typeof emailTestSchema>;

/**
 * Helper function to validate and parse email request
 * @param data - Raw data to validate
 * @returns Parsed and validated data or errors
 */
export function validateSendEmailRequest(data: unknown) {
  try {
    return {
      success: true,
      data: sendEmailSchema.parse(data),
      errors: [],
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        data: null,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      };
    }
    return {
      success: false,
      data: null,
      errors: [{ field: 'unknown', message: 'Validation error' }],
    };
  }
}

/**
 * Helper function to validate user contact request
 */
export function validateUserContactRequest(data: unknown) {
  try {
    return {
      success: true,
      data: userContactSchema.parse(data),
      errors: [],
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        data: null,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      };
    }
    return {
      success: false,
      data: null,
      errors: [{ field: 'unknown', message: 'Validation error' }],
    };
  }
}
