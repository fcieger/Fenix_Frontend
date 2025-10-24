import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    if (!apiUrl) {
      return NextResponse.json({
        frontend: 'ok',
        backend: 'unreachable',
        error: 'NEXT_PUBLIC_API_URL not configured',
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }

    const apiResponse = await fetch(`${apiUrl}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!apiResponse.ok) {
      throw new Error(`Backend returned ${apiResponse.status}`);
    }

    const apiStatus = await apiResponse.json();

    return NextResponse.json({
      frontend: 'ok',
      backend: apiStatus.status,
      environment: apiStatus.environment,
      database: apiStatus.database,
      redis: apiStatus.redis,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      frontend: 'ok',
      backend: 'unreachable',
      error: (error as Error).message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
