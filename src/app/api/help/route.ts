import { NextResponse } from 'next/server';
import { API_HELP } from '@/lib/api-help';

export async function GET() {
  return NextResponse.json(API_HELP, { status: 200 });
}
