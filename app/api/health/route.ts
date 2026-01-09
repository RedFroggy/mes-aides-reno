import { NextResponse } from 'next/server'

/**
 * Health Check Endpoint
 * Used by Docker HEALTHCHECK, HAProxy, and monitoring tools
 *
 * @returns JSON response with health status
 */
export async function GET() {
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true'

  const health = {
    status: isMaintenanceMode ? 'maintenance' : 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_COMMIT_ID,
    uptime: process.uptime(),
  }

  return NextResponse.json(health, { status: 200 })
}

// Disable static generation for this route
export const dynamic = 'force-dynamic'
