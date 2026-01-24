import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { protocol, origin, path, method, headers, body: requestBody } = body

    if (!protocol || !origin || !path || !method) {
      return NextResponse.json(
        { error: 'Missing required fields: protocol, origin, path, or method' },
        { status: 400 }
      )
    }

    const targetUrl = `${protocol}://${origin}${path}`

    const fetchOptions: RequestInit = {
      method,
      headers: headers || {},
    }

    if (requestBody && method !== 'GET' && method !== 'HEAD') {
      if (requestBody instanceof FormData) {
        fetchOptions.body = requestBody
      } else if (typeof requestBody === 'object') {
        fetchOptions.body = JSON.stringify(requestBody)
        if (!fetchOptions.headers) fetchOptions.headers = {}
        ;(fetchOptions.headers as Record<string, string>)['Content-Type'] = 'application/json'
      } else {
        fetchOptions.body = requestBody
      }
    }

    const response = await fetch(targetUrl, fetchOptions)
    const contentType = response.headers.get('content-type')

    let data: unknown
    if (contentType?.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    return NextResponse.json(
      { data, status: response.status },
      { status: response.status }
    )
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Proxy request failed' },
      { status: 500 }
    )
  }
}
