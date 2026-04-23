import { getExchangeRates } from '@/lib/currency';
import { NextResponse } from 'next/server';

export async function GET() {
  const rates = await getExchangeRates();
  return NextResponse.json({ rates });
}
