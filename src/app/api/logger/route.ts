import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    
    const logLevel = body.level || 'info'
    const logMessage = body.message || 'No message provided'
    const logData = body.data || {}
    
    console.log(`[${logLevel.toUpperCase()}]`, logMessage, logData)
    
    return NextResponse.json(
      { 
        success: true,
        logged: true,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Logger endpoint error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to log message',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      message: 'Logger endpoint - Use POST to log messages',
      usage: {
        method: 'POST',
        body: {
          level: 'info | warn | error',
          message: 'Your log message',
          data: 'Optional additional data'
        }
      }
    },
    { status: 200 }
  )
}
