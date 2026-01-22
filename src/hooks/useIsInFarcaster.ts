import { sdk } from '@farcaster/miniapp-sdk'
import { useEffect, useState } from 'react'

export function useIsInFarcaster(): boolean {
  const [isInFarcaster, setIsInFarcaster] = useState<boolean>(false)
  const [isChecking, setIsChecking] = useState<boolean>(true)

  useEffect(() => {
    let mounted = true

    const checkFarcasterContext = async (): Promise<void> => {
      try {
        // Wait for SDK to be ready first
        await sdk.actions.ready()
        
        // Use isInMiniApp() for reliable detection of embedded webview
        const inMiniApp = await sdk.isInMiniApp()
        
        if (mounted) {
          setIsInFarcaster(inMiniApp)
          setIsChecking(false)
          console.log('✅ Farcaster webview detected:', inMiniApp)
        }
      } catch (error) {
        console.warn('⚠️ Not in Farcaster context:', error)
        if (mounted) {
          setIsInFarcaster(false)
          setIsChecking(false)
        }
      }
    }

    checkFarcasterContext()

    return () => {
      mounted = false
    }
  }, [])

  // Return false while checking to avoid flashing UI
  return isChecking ? false : isInFarcaster
}
