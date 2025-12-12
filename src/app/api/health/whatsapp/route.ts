import { NextResponse } from 'next/server';

// Prevent this route from being statically exported during build
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // WhatsApp direct integration is always available
    // No need to check external services
    return NextResponse.json({
      service: 'whatsapp',
      status: 'healthy',
      type: 'direct-integration',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      service: 'whatsapp',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 200 });
  }
}
