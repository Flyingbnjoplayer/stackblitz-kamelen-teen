'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { sdk } from '@farcaster/miniapp-sdk'

export function useFarcasterWallet() {
  const { address, isConnected, connector } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  
  const [isInFarcaster, setIsInFarcaster] = useState(false)
  const [farcasterUsername, setFarcasterUsername] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Check if we're in Farcaster context
  useEffect(() => {
    let mounted = true

    const checkFarcasterContext = async () => {
      try {
        const inMiniApp = await sdk.isInMiniApp()
        
        if (!mounted) return
        
        setIsInFarcaster(inMiniApp)

        if (inMiniApp) {
          // Get user context
          const context = await sdk.context
          
          if (mounted && context?.user) {
            if (context.user.username) {
              setFarcasterUsername(context.user.username)
            }
          }
        }
      } catch (error) {
        console.log('Not in Farcaster context:', error)
      } finally {
        if (mounted) setIsInitialized(true)
      }
    }

    checkFarcasterContext()

    return () => {
      mounted = false
    }
  }, [])

  // In Farcaster context: ensure Farcaster connector is active
  useEffect(() => {
    if (!isInitialized || !isInFarcaster) return

    const ensureFarcasterConnector = async () => {
      // If connected but NOT to Farcaster connector, disconnect and reconnect
      if (isConnected && connector && connector.id !== 'farcaster') {
        console.log('🔄 Wrong connector active:', connector.id, '- switching to Farcaster')
        
        // Disconnect current connector
        disconnect()
        
        // Wait a moment for disconnect to complete
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Find Farcaster connector and connect
        const farcasterConn = connectors.find(c => c.id === 'farcaster')
        if (farcasterConn) {
          try {
            await connect({ connector: farcasterConn })
            console.log('✅ Connected to Farcaster wallet')
          } catch (e) {
            console.error('Failed to connect Farcaster wallet:', e)
          }
        }
      }
      
      // If not connected at all in Farcaster context, connect Farcaster wallet
      if (!isConnected) {
        const farcasterConn = connectors.find(c => c.id === 'farcaster')
        if (farcasterConn) {
          try {
            await connect({ connector: farcasterConn })
            console.log('✅ Connected to Farcaster wallet')
          } catch (e) {
            console.error('Failed to connect Farcaster wallet:', e)
          }
        }
      }
    }

    ensureFarcasterConnector()
  }, [isInitialized, isInFarcaster, isConnected, connector, connectors, connect, disconnect])

  return {
    address,
    isConnected: isInFarcaster ? isConnected : isConnected,
    isInFarcaster,
    farcasterUsername,
    isInitialized,
  }
}