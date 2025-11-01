import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple middleware that allows all requests
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/about", "/faq"],
}
