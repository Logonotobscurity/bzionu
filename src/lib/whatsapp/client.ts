/**
 * WhatsApp Direct Integration
 * Uses WhatsApp Business API via direct URLs (wa.me)
 * No server-side WAHA dependency required
 */

export class WhatsAppClient {
  private businessPhone: string;

  constructor() {
    // Business phone number for WhatsApp messages
    this.businessPhone = process.env.WHATSAPP_BUSINESS_NUMBER || '';
  }

  /**
   * Generate a WhatsApp message URL for direct messaging
   * Works on both mobile and desktop
   */
  generateMessageUrl(phoneNumber: string, message: string): string {
    const encodedMessage = encodeURIComponent(message);
    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  }

  /**
   * Format phone number for WhatsApp (remove + and special characters)
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    // Ensure it has country code (should be 10+ digits)
    return cleaned.length >= 10 ? cleaned : '';
  }

  /**
   * Send text via WhatsApp (returns URL for user to open)
   */
  async sendText(to: string, text: string): Promise<{ url: string; message: string }> {
    const url = this.generateMessageUrl(to, text);
    return { url, message: text };
  }

  /**
   * Send image via WhatsApp (returns URL for user to open)
   */
  async sendImage(to: string, imageUrl: string, caption?: string): Promise<{ url: string }> {
    const message = caption ? `${caption}\n\n${imageUrl}` : imageUrl;
    const url = this.generateMessageUrl(to, message);
    return { url };
  }

  /**
   * Check connection status (always available with direct URLs)
   */
  async getSessionStatus(): Promise<{ status: 'WORKING' | 'UNAVAILABLE' }> {
    return { status: 'WORKING' };
  }
}

export const whatsappClient = new WhatsAppClient();

