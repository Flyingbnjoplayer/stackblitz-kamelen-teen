'use client'

import { useEffect, useState } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { sdk } from '@farcaster/miniapp-sdk'

/**
 * Hook to manage Farcaster wallet connection.
 * Disconnects other wallets when Farcaster wallet is active.
 */
export function useFarcasterWallet() {
  const { address, isConnected, connector } = useAccount()
  const { disconnect } = useDisconnect()
  const [farcasterAddress, setFarcasterAddress] = useState<`0x${string}` | null>(null)
  const [isInFarcaster, setIsInFarcaster] = useState(false)
  const [farcasterUsername, setFarcasterUsername] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const initFarcasterWallet = async () => {
      try {
        const inMiniApp = await sdk.isInMiniApp()
        
        if (!mounted) return
        
        setIsInFarcaster(inMiniApp)

        if (inMiniApp) {
          // Get user context
          const context = await sdk.context
          
          if (mounted && context?.user) {
            // Set username
            if (context.user.username) {
              setFarcasterUsername(context.user.username)
            }
            
            // Get wallet address from context
            // The custody address is the user's Farcaster wallet
            if (context.user.custody) {
              setFarcasterAddress(context.user.custody as `0x${string}`)
            }
          }
        }
      } catch (error) {
        console.log('Not in Farcaster context:', error)
      }
    }

    initFarcasterWallet()

    return () => {
      mounted = false
    }
  }, [])

  // Disconnect non-Farcaster wallets when in Farcaster context
  useEffect(() => {
    if (isInFarcaster && isConnected && connector) {
      // If connected to a non-Farcaster connector, disconnect it
      if (connector.id !== 'farcaster' && connector.name !== 'Farcaster') {
        console.log('Disconnecting non-Farcaster wallet:', connector.name)
        disconnect()
      }
    }
  }, [isInFarcaster, isConnected, connector, disconnect])

  // Return Farcaster address when in Farcaster context, otherwise wagmi address
  const activeAddress = isInFarcaster && farcasterAddress 
    ? farcasterAddress 
    : address

  return {
    address: activeAddress,
    isConnected: isInFarcaster ? !!farcasterAddress : isConnected,
    isInFarcaster,
    farcasterUsername,
    farcasterAddress,
  }
}
