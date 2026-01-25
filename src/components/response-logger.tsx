'use client'

import { useEffect } from 'react'

export function ResponseLogger() {
  useEffect(() => {
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const response = await originalFetch(...args)
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

    return () => {
      window.fetch = originalFetch
    }
  }, [])

  return null
}
