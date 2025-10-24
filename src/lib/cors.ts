import { NextResponse } from 'next/server'

export function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

export function handleCors(request: Request) {
  if (request.method === 'OPTIONS') {
    const response = new Response(null, { status: 200 })
    return addCorsHeaders(response)
  }
  return null
}
