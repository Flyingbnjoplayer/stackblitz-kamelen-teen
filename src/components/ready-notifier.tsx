'use client'

import { useEffect, useState } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

export function ReadyNotifier() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        // Call Farcaster SDK ready() to signal app is loaded
        // This enables wallet connection and manifest signing
        await sdk.actions.ready()
        console.log('Farcaster SDK ready')
        setIsReady(true)
      } catch (error) {
        // Not running in Farcaster context (browser) - that's fine
        console.log('Not in Farcaster context:', error)
        setIsReady(true)
      }
    }
    init()
  }, [])

  return null
}