import { whatsappClient } from '@/lib/whatsapp/client';
import { formatQuoteMessage, formatCustomerConfirmation } from '@/lib/whatsapp/templates';
import type { QuoteNotification } from '@/lib/whatsapp/types';

export class WhatsAppService {
  /**
   * Generate WhatsApp URL for quote notification
   * Returns the URL instead of sending directly
   */
  async sendQuoteNotification(data: QuoteNotification): Promise<{ url: string; message: string }> {
    const businessPhone = process.env.WHATSAPP_BUSINESS_NUMBER;
    
    if (!businessPhone) {
      console.warn('WHATSAPP_BUSINESS_NUMBER not configured');
      return { url: '', message: '' };
    }

    const message = formatQuoteMessage(data);
    return whatsappClient.sendText(businessPhone, message);
  }

  /**
   * Generate WhatsApp URL for customer confirmation
   * Returns the URL instead of sending directly
   */
  async sendCustomerConfirmation(
    customerPhone: string,
    customerName: string,
    quoteReference: string
  ): Promise<{ url: string; message: string }> {
    const message = formatCustomerConfirmation(customerName, quoteReference);
    return whatsappClient.sendText(customerPhone, message);
  }

  /**
   * Check WhatsApp connection status
   * Always available with direct URLs
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await whatsappClient.getSessionStatus();
      return response.status === 'WORKING';
    } catch {
      return true; // Direct URLs always work
    }
  }
}

export const whatsappService = new WhatsAppService();
