/**
 * Email Validation & Sanitization Module
 * Provides comprehensive email validation, domain checking, and XSS protection
 * 
 * Features:
 * - RFC 5322 compliant email format validation
 * - Domain DNS verification
 * - Disposable email detection
 * - XSS/injection sanitization
 * - Rate limiting per email address
 */

// RFC 5322 simplified regex (practical validation)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Stricter pattern for validation
const STRICT_EMAIL_REGEX = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Common disposable email domains (non-exhaustive list)
const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'maildrop.cc',
  'mailinator.com',
  'temp-mail.org',
  'throwaway.email',
  'yopmail.com',
  'fakeinbox.com',
  'tempmail.org',
  'testing123.com',
  'testtesting.com',
]);

export interface EmailValidationResult {
  isValid: boolean;
  email: string;
  normalized: string;
  errors: string[];
  warnings: string[];
}

export interface SendEmailRequest {
  to: string;
  subject: string;
  message: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: string;
  }>;
}

/**
 * Validate email format and structure
 * @param email - Email address to validate
 * @returns Validation result with normalized email
 */
export function validateEmailFormat(email: string): EmailValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic checks
  if (!email) {
    errors.push('Email address is required');
    return { isValid: false, email: '', normalized: '', errors, warnings };
  }

  // Normalize: trim whitespace and convert to lowercase
  const normalized = email.trim().toLowerCase();

  // Length validation (RFC 5321)
  if (normalized.length > 254) {
    errors.push('Email address is too long (max 254 characters)');
  }

  if (normalized.length < 3) {
    errors.push('Email address is too short (min 3 characters)');
  }

  // Format validation
  if (!STRICT_EMAIL_REGEX.test(normalized)) {
    errors.push('Email format is invalid');
  }

  // Check for multiple @ symbols
  if ((normalized.match(/@/g) || []).length !== 1) {
    errors.push('Email must contain exactly one @ symbol');
  }

  // Split into local and domain parts
  const [localPart, domain] = normalized.split('@');

  // Validate local part (before @)
  if (localPart && localPart.length > 64) {
    errors.push('Email local part is too long (max 64 characters)');
  }

  if (localPart?.startsWith('.') || localPart?.endsWith('.')) {
    errors.push('Email local part cannot start or end with a dot');
  }

  if (localPart?.includes('..')) {
    errors.push('Email local part cannot contain consecutive dots');
  }

  // Validate domain part
  if (!domain) {
    errors.push('Email domain is missing');
  } else {
    // Domain length check
    if (domain.length > 255) {
      errors.push('Email domain is too long (max 255 characters)');
    }

    // Check for valid TLD
    const domainParts = domain.split('.');
    if (domainParts.length < 2) {
      errors.push('Email domain must have at least one dot');
    }

    const tld = domainParts[domainParts.length - 1];
    if (!tld || tld.length < 2) {
      errors.push('Email domain has invalid top-level domain');
    }

    // Check for numbers-only TLD (invalid)
    if (/^\d+$/.test(tld)) {
      errors.push('Email domain TLD cannot be numeric only');
    }

    // Check for invalid domain characters
    if (!/^[a-z0-9.-]+$/.test(domain)) {
      errors.push('Email domain contains invalid characters');
    }

    // Consecutive dots in domain
    if (domain.includes('..')) {
      errors.push('Email domain cannot contain consecutive dots');
    }
  }

  // Warnings for common issues
  if (normalized.includes('+')) {
    warnings.push('Email contains plus addressing (may not work with all services)');
  }

  if (domain && DISPOSABLE_DOMAINS.has(domain)) {
    warnings.push('Email uses a disposable/temporary email service');
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    email: normalized,
    normalized,
    errors,
    warnings,
  };
}

/**
 * Check if email domain has valid DNS MX records
 * Note: This should be called server-side only for security
 * @param domain - Domain to check
 * @returns Promise<boolean> - True if MX records exist
 */
export async function checkDomainMX(domain: string): Promise<boolean> {
  try {
    // In Node.js, we can use dns module
    if (typeof window !== 'undefined') {
      // Client-side: cannot perform DNS checks
      return true;
    }

    const dns = await import('dns').then(m => m.promises);
    const mxRecords = await dns.resolveMx(domain);
    return mxRecords && mxRecords.length > 0;
  } catch (error) {
    console.warn(`[EMAIL_VALIDATION] MX check failed for ${domain}:`, error);
    // Don't fail validation if DNS check fails - may be network issue
    return true;
  }
}

/**
 * Sanitize email to prevent XSS and injection attacks
 * @param email - Raw email input
 * @returns Sanitized email
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';

  // Remove any HTML/script tags
  let sanitized = email.replace(/<[^>]*>/g, '');

  // Remove control characters and invalid Unicode
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

  // Normalize whitespace
  sanitized = sanitized.trim();

  // Remove quotes if wrapped (RFC 5321 allows quoted strings)
  if (sanitized.startsWith('"') && sanitized.endsWith('"')) {
    sanitized = sanitized.slice(1, -1);
  }

  return sanitized.toLowerCase();
}

/**
 * Sanitize text/HTML content to prevent XSS
 * @param content - Raw content input
 * @param allowHtml - Allow HTML tags (for email templates)
 * @returns Sanitized content
 */
export function sanitizeContent(content: string, allowHtml = false): string {
  if (!content) return '';

  let sanitized = content;

  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  if (!allowHtml) {
    // Remove HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  } else {
    // Remove dangerous attributes and tags while keeping safe HTML
    sanitized = sanitized
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
      .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '') // Remove iframes
      .replace(/<embed[^>]*>/gi, '') // Remove embeds
      .replace(/<object[^>]*>[\s\S]*?<\/object>/gi, ''); // Remove objects
  }

  // Limit content length to prevent memory issues
  if (sanitized.length > 50000) {
    sanitized = sanitized.substring(0, 50000);
  }

  return sanitized.trim();
}

/**
 * Validate complete email sending request
 * @param request - Email send request
 * @returns Validation result
 */
export async function validateEmailRequest(
  request: Partial<SendEmailRequest>
): Promise<{ isValid: boolean; errors: string[] }> {
  const errors: string[] = [];

  // Validate recipient
  if (!request.to) {
    errors.push('Recipient email (to) is required');
  } else {
    const validation = validateEmailFormat(request.to);
    if (!validation.isValid) {
      errors.push(`Invalid recipient email: ${validation.errors[0]}`);
    }
  }

  // Validate subject
  if (!request.subject) {
    errors.push('Email subject is required');
  } else if (request.subject.length < 3) {
    errors.push('Email subject is too short (min 3 characters)');
  } else if (request.subject.length > 200) {
    errors.push('Email subject is too long (max 200 characters)');
  }

  // Validate message/content
  if (!request.message && !request.html) {
    errors.push('Email message or HTML content is required');
  }

  if (request.message && request.message.length < 3) {
    errors.push('Email message is too short (min 3 characters)');
  }

  if ((request.message || '').length + (request.html || '').length > 100000) {
    errors.push('Email content is too large (max 100KB combined)');
  }

  // Validate attachments if present
  if (request.attachments && Array.isArray(request.attachments)) {
    if (request.attachments.length > 10) {
      errors.push('Too many attachments (max 10)');
    }

    for (const attachment of request.attachments) {
      if (!attachment.filename || !attachment.content) {
        errors.push('Attachment must have filename and content');
      }
      if (attachment.filename.length > 255) {
        errors.push(`Attachment filename too long: ${attachment.filename}`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Rate limiting check - in-memory simple implementation
 * For production, use Redis or database
 */
const emailRateLimits = new Map<string, { count: number; resetTime: number }>();

/**
 * Check if email exceeds rate limit
 * @param email - Email address
 * @param limit - Max requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if within limit, false if exceeded
 */
export function checkEmailRateLimit(
  email: string,
  limit = 5,
  windowMs = 60 * 60 * 1000 // 1 hour default
): boolean {
  const now = Date.now();
  const record = emailRateLimits.get(email);

  // Create new record if doesn't exist
  if (!record) {
    emailRateLimits.set(email, { count: 1, resetTime: now + windowMs });
    return true;
  }

  // Reset if window expired
  if (now > record.resetTime) {
    emailRateLimits.set(email, { count: 1, resetTime: now + windowMs });
    return true;
  }

  // Check if limit exceeded
  if (record.count >= limit) {
    return false;
  }

  // Increment count
  record.count += 1;
  return true;
}

/**
 * Get rate limit status
 * @param email - Email address
 * @returns Status information
 */
export function getEmailRateLimitStatus(email: string): {
  limited: boolean;
  remaining: number;
  resetTime: Date | null;
} {
  const record = emailRateLimits.get(email);
  const now = Date.now();

  if (!record || now > record.resetTime) {
    return {
      limited: false,
      remaining: 5,
      resetTime: null,
    };
  }

  return {
    limited: record.count >= 5,
    remaining: Math.max(0, 5 - record.count),
    resetTime: new Date(record.resetTime),
  };
}

/**
 * Clear all rate limit records (for testing)
 */
export function clearEmailRateLimits(): void {
  emailRateLimits.clear();
}
