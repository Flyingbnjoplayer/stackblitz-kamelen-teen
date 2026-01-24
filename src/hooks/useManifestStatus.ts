import { useEffect, useState } from 'react'

interface ManifestStatusResult {
  isSigned: boolean
  isLoading: boolean
  refetch: () => void
}

export function useManifestStatus(): ManifestStatusResult {
  const [isSigned, setIsSigned] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [refetchTrigger, setRefetchTrigger] = useState<number>(0)

  useEffect(() => {
    const checkManifestStatus = async (): Promise<void> => {
      try {
        setIsLoading(true)
        const response = await fetch('/.well-known/farcaster.json')
        const data = await response.json()
        
        // Check if accountAssociation has all required fields
        const hasSignature = data?.accountAssociation?.signature && 
                           data?.accountAssociation?.signature.length > 0
        const hasHeader = data?.accountAssociation?.header && 
                        data?.accountAssociation?.header.length > 0
        const hasPayload = data?.accountAssociation?.payload && 
                         data?.accountAssociation?.payload.length > 0
        
        setIsSigned(hasSignature && hasHeader && hasPayload)
      } catch (error) {
        console.error('Error checking manifest status:', error)
        setIsSigned(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkManifestStatus()
  }, [refetchTrigger])

  const refetch = (): void => {
    setRefetchTrigger(prev => prev + 1)
  }

  return { isSigned, isLoading, refetch }
}

export function useIsManifestSigned(): { isSigned: boolean; isLoading: boolean } {
  const { isSigned, isLoading } = useManifestStatus()
  return { isSigned, isLoading }
}
