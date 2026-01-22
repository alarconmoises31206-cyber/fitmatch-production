import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()

  // Redirect direct access to /signup to /invite-required
  if (url.pathname === '/signup' && !url.searchParams.has('inviteToken')) {
    url.pathname = '/invite-required';
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/signup',
}
