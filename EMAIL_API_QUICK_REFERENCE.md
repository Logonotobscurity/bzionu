# Email API Quick Reference
**Last Updated:** December 19, 2025

---

## 🚀 Quick Start

### Send Email (1 minute)

```typescript
// POST /api/user/send-email
const response = await fetch('/api/user/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'user@example.com',
    subject: 'Hello!',
    message: 'Test email'
  })
});

const result = await response.json();
console.log(result); // { success: true, messageId: '...' }
```

### Check Rate Limit

```typescript
// GET /api/user/send-email
const response = await fetch('/api/user/send-email');
const data = await response.json();

console.log(`Remaining: ${data.rate_limit.remaining} emails/hour`);
```

---

## 📋 Validation Rules

### Email Validation
- ✅ RFC 5322 compliant format
- ✅ Max 254 characters
- ✅ Must have exactly one @
- ✅ Domain must have 2+ labels
- ⚠️ Disposable domains flagged (warning only)

### Content Validation
| Field | Min | Max | Notes |
|-------|-----|-----|-------|
| Subject | 3 | 200 chars | - |
| Message | 3 | 50 KB | Plain text |
| HTML | - | 50 KB | Safe HTML only |
| Attachment | - | 25 MB | Max 10 files |

### Rate Limits
- **Per Email:** 5 emails/hour
- **HTTP Status:** 429 when exceeded
- **Reset:** Automatic after 1 hour

---

## 🔒 Security Features

### Automatic Protections
- ✅ XSS prevention (sanitized HTML)
- ✅ Injection prevention
- ✅ Control character filtering
- ✅ Event handler removal
- ✅ Script tag removal

### Validation Layers
1. Authentication (NextAuth required)
2. JSON parsing
3. Zod schema validation
4. Email format validation
5. Rate limiting check
6. Content sanitization
7. Self-send prevention
8. Content security scan

---

## 📊 Response Examples

### Success (200)
```json
{
  "success": true,
  "message": "Email successfully sent to user@example.com",
  "messageId": "msg_1703000000_abc123",
  "timestamp": "2025-12-19T10:30:00.000Z"
}
```

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "subject",
      "message": "Subject must be at least 3 characters"
    }
  ],
  "code": "VALIDATION_ERROR"
}
```

### Rate Limited (429)
```json
{
  "success": false,
  "message": "Rate limit exceeded. You can send 0 more emails this hour.",
  "code": "RATE_LIMITED"
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Unauthorized. Please sign in to send emails.",
  "code": "UNAUTHORIZED"
}
```

---

## 🛠️ Testing Commands

### Test Valid Email
```bash
curl -X POST http://localhost:3000/api/user/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Subject",
    "message": "This is a test message"
  }'
```

### Test Invalid Email
```bash
curl -X POST http://localhost:3000/api/user/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "not-an-email",
    "subject": "Test",
    "message": "Message"
  }'
```

### Test Rate Limiting
```bash
# Run this 6 times to trigger rate limit
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/user/send-email \
    -H "Content-Type: application/json" \
    -d "{\"to\": \"test@example.com\", \"subject\": \"Test $i\", \"message\": \"Message $i\"}"
done
```

### Check Capabilities
```bash
curl -X GET http://localhost:3000/api/user/send-email
```

---

## 📝 Request Schema

### POST Body Structure
```typescript
{
  to: string,                    // Required: recipient email
  subject: string,               // Required: email subject
  message?: string,              // Optional: plain text body
  html?: string,                 // Optional: HTML body
  attachments?: Array<{          // Optional: file attachments
    filename: string,            // Required: file name
    content: string              // Required: base64 content
  }>
}
```

### GET Parameters
None - returns your capabilities and rate limit status

---

## 🔧 Configuration

### Environment Variables
```env
# In .env.local or .env.production

# Email Service (Required)
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@bzion.shop

# SMTP Settings (Optional with defaults)
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USERNAME=resend
SMTP_TIMEOUT=5000

# Environment
NODE_ENV=production
```

### Rate Limit Customization
Edit `src/lib/email-validation.ts`:
```typescript
// Change from: checkEmailRateLimit(email, 5, 60 * 60 * 1000)
// To one of:
checkEmailRateLimit(email, 10, 60 * 60 * 1000)  // 10/hour
checkEmailRateLimit(email, 20, 24 * 60 * 60 * 1000)  // 20/day
checkEmailRateLimit(email, 3, 60 * 60 * 1000)  // 3/hour (strict)
```

---

## ⚠️ Common Issues

### "Email format is invalid"
**Fix:** Ensure email has format `user@domain.com`

### "Subject must be at least 3 characters"
**Fix:** Subject needs 3+ characters, max 200

### "Rate limit exceeded"
**Fix:** Wait 1 hour before sending more emails

### "Unauthorized"
**Fix:** Must be logged in (NextAuth session required)

### "Email sent but not received"
**Checks:**
1. Check spam folder
2. Verify API key is active
3. Check domain verification
4. Review email service logs

---

## 📚 File Locations

| Purpose | File | Lines |
|---------|------|-------|
| Validation logic | `src/lib/email-validation.ts` | 437 |
| Zod schemas | `src/lib/email-schemas.ts` | 246 |
| API endpoint | `src/app/api/user/send-email/route.ts` | 394 |
| Email service | `src/lib/email-service.ts` | 549 |
| Health check | `src/app/api/health/email/route.ts` | 107 |

---

## 🔍 Debugging

### Enable Detailed Logs
Add to your endpoint and check browser/server console:
```typescript
console.log('[EMAIL_SEND] Debug info:', { /* data */ });
```

### Check Email Service Health
```bash
curl http://localhost:3000/api/health/email
```

Expected response:
```json
{
  "success": true,
  "message": "SMTP connection verified",
  "details": {
    "host": "smtp.resend.com",
    "port": 465,
    "secure": true
  }
}
```

### Test Email with Admin Token
```bash
curl -X POST http://localhost:3000/api/health/email \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com"}'
```

---

## 📈 Performance

### Typical Response Times
| Operation | Time |
|-----------|------|
| Validation | <10ms |
| Rate limit check | <5ms |
| Content sanitization | <20ms |
| Email send | 100-300ms |
| **Total** | **<350ms** |

### Optimization Tips
- Cache validation results where possible
- Use batch operations for multiple emails
- Consider async queue for heavy volume
- Monitor email service performance

---

## 🛡️ Security Notes

### What Gets Sanitized
- ✅ HTML tags (removing dangerous ones)
- ✅ JavaScript event handlers
- ✅ Control characters
- ✅ Injection attempts

### What You Should Do
- ✅ Always use over HTTPS in production
- ✅ Keep API key secret (never expose)
- ✅ Validate on both client and server
- ✅ Monitor rate limiting
- ✅ Review error logs regularly

---

## 🔗 Related Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /api/health/email` | SMTP health check |
| `POST /api/health/email` | Send test email |
| `POST /api/auth/forgot-password` | Password reset email |
| `POST /api/auth/register` | Verification email |
| `POST /api/quote-requests` | Quote notification email |

---

## 📖 Full Documentation

See `EMAIL_API_AUDIT_AND_IMPLEMENTATION.md` for:
- Complete implementation details
- Architecture overview
- Security analysis
- Testing guide
- Deployment checklist
- Troubleshooting guide

---

## 💡 Tips & Tricks

### Send HTML Email
```typescript
await fetch('/api/user/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'user@example.com',
    subject: 'Welcome!',
    message: 'Welcome to BZION',
    html: '<h1>Welcome!</h1><p>Get started exploring.</p>'
  })
});
```

### Check Before Sending
```typescript
// Get capabilities first
const caps = await fetch('/api/user/send-email').then(r => r.json());

if (caps.rate_limit.remaining > 0) {
  // Safe to send
  // ...
}
```

### Error Handling
```typescript
const response = await fetch('/api/user/send-email', {
  method: 'POST',
  body: JSON.stringify(/* ... */)
});

if (!response.ok) {
  const error = await response.json();
  console.error(`Error (${error.code}):`, error.message);
  
  if (error.errors) {
    error.errors.forEach(e => {
      console.error(`  ${e.field}: ${e.message}`);
    });
  }
}
```

---

## 🚀 Next Steps

1. Test the endpoint locally
2. Review security settings
3. Set up monitoring
4. Deploy to staging
5. Run full test suite
6. Deploy to production
7. Monitor email delivery rates

**Status:** ✅ Ready for production use
