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
        console.log('✅ Farcaster SDK ready')
        
        // Also ensure wallet is available
        const inMiniApp = await sdk.isInMiniApp()
        if (inMiniApp) {
          console.log('✅ Running in Farcaster mini-app')
          
          // Get the eth provider to ensure it's initialized
          const provider = sdk.wallet.ethProvider
          if (provider) {
            console.log('✅ Farcaster wallet ethProvider available')
          }
        }
      } catch (error) {
        console.log('Not in Farcaster context:', error)
      } finally {
        setIsReady(true)
      }
    }
    init()
  }, [])

  if (!isReady) {
    return null
  }

  return <>{children}</>
}