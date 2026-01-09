import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Maintenance Mode Middleware
 *
 * When MAINTENANCE_MODE=true, redirects all requests (except whitelisted paths)
 * to the maintenance page which returns HTTP 503.
 *
 * Whitelisted paths:
 * - /api/health - Health checks for Docker, load balancer, monitoring
 * - /maintenance - The maintenance page itself
 */
export function middleware(request: NextRequest) {
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true'

  if (!isMaintenanceMode) {
    return NextResponse.next()
  }

  const pathname = request.nextUrl.pathname

  const whitelist = [
    '/api/health',
    '/maintenance',
  ]

  if (whitelist.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Rewrite all other requests to maintenance route handler
  const url = request.nextUrl.clone()
  url.pathname = '/maintenance'
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
