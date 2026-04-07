'use client'

import { useEffect, useState } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

interface FarcasterSdkReadyProps {
  children: React.ReactNode
}

export function FarcasterSdkReady({ children }: FarcasterSdkReadyProps) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        // Call SDK ready BEFORE any wagmi connectors initialize
        await sdk.actions.ready()
        console.log('✅ Farcaster SDK ready before wagmi init')
      } catch (error) {
        // Not in Farcaster context - that's fine
        console.log('Not in Farcaster context:', error)
      } finally {
        setIsReady(true)
      }
    }
    init()
  }, [])

  if (!isReady) {
    // Show nothing while initializing - prevents flash
    return null
  }

  return <>{children}</>
}
