/**
 * WhatsApp Integration Service
 * Uses WhatsApp URL scheme to open WhatsApp with pre-filled messages
 * No API key required - works directly through WhatsApp links
 */

interface QuoteRequestMessage {
  name: string;
  email: string;
  phone: string;
  company?: string;
  address: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
}

// Use the specific BZION WhatsApp Business URL provided by the user
const WHATSAPP_BUSINESS_URL = 'https://api.whatsapp.com/message/TOVLTP6EMAWNI1';

/**
 * Generates a WhatsApp message URL for quote requests
 * Use this to create a link that opens WhatsApp with pre-filled message
 */
export function generateQuoteRequestWhatsAppURL(
  data: QuoteRequestMessage
): string {
  // Format product list
  const productList = data.items
    .map((item) => `• ${item.name} (Qty: ${item.quantity})`)
    .join('%0A');

  // Create message
  const message = `
*New Quote Request* 📋

*Customer Information:*
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}
Company: ${data.company || 'N/A'}
Delivery Address: ${data.address}

*Requested Products:*
${productList}

*Total Items:* ${data.items.reduce((sum, item) => sum + item.quantity, 0)}

---
Please respond to this customer within 24 hours.
  `.trim();

  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);

  // Return WhatsApp URL
  return `${WHATSAPP_BUSINESS_URL}?text=${encodedMessage}`;
}

/**
 * Generates a WhatsApp message URL for customer confirmation
 */
export function generateCustomerConfirmationURL(
  customerPhone: string,
  quoteReference: string
): string {
  const message = `
Hello! 👋

Thank you for your quote request!

Your quote reference number is: *${quoteReference}*

Our team will review your request and get back to you with a detailed quotation shortly.

Best regards,
BZION | Your Trusted Partner in FMCG Distribution
  `.trim();

  const encodedMessage = encodeURIComponent(message);
  const cleanPhone = customerPhone.replace(/\D/g, '');

  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Opens WhatsApp in a new tab with pre-filled message
 */
export function openWhatsAppChat(url: string): void {
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Sends a WhatsApp quote request notification
 * This function integrates with the quote request API
 * @returns WhatsApp URL for opening chat
 */
export async function sendQuoteRequestToWhatsApp(
  data: QuoteRequestMessage
): Promise<{ success: boolean; whatsappUrl?: string; error?: string }> {
  try {
    const whatsappUrl = generateQuoteRequestWhatsAppURL(data);
    return {
      success: true,
      whatsappUrl,
    };
  } catch (error) {
    console.error('Failed to generate WhatsApp URL:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
