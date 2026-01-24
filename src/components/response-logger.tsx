'use client'

import { useEffect } from 'react'

export function ResponseLogger() {
  useEffect(() => {
    // Log successful responses from API calls
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const response = await originalFetch(...args)
      
      // Clone the response so we can read it
      const clonedResponse = response.clone()
      
      try {
        const data = await clonedResponse.json()
        console.log('API Response:', {
          url: args[0],
          status: response.status,
          data
        })
      } catch {
        // Not JSON, skip logging
      }
      
      return response
    }

    // Cleanup
    return () => {
      window.fetch = originalFetch
    }
  }, [])

  return null
}

