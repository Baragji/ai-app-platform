import { NextResponse } from 'next/server';

// Disable auth middleware to avoid redirect races during login.
// The Projects page has an SSR guard using getServerSession that handles protection reliably.
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
