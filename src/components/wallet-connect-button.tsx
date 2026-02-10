//stackblitz-kamelen-teen/src/components/wallet-connect-button.tsx
'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useEffect, useState, useRef } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { Button } from './ui/button';
import { Wallet, LogOut, Loader2, ChevronDown } from 'lucide-react';

export function WalletConnectButton() {
  const { address, status } = useAccount();
  const { connect, connectors, isPending, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();

  const [farcasterUsername, setFarcasterUsername] = useState<string | null>(null);
  const [isInFarcaster, setIsInFarcaster] = useState(false);
  const [showConnectors, setShowConnectors] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowConnectors(false);
      }
    }
    if (showConnectors) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showConnectors]);

  // Farcaster context
  useEffect(() => {
    let cancelled = false;
    async function checkFarcaster() {
      try {
        const inMiniApp = await sdk.isInMiniApp();
        if (!cancelled) {
          setIsInFarcaster(inMiniApp);
          if (inMiniApp) {
            const context = await sdk.context;
            if (!cancelled && context?.user?.username) {
              setFarcasterUsername(context.user.username);
            }
          }
        }
      } catch {
        if (!cancelled) setIsInFarcaster(false);
      }
    }
    checkFarcaster();
    return () => {
      cancelled = true;
    };
  }, []);

  // Connection errors (schedule state updates; avoid sync setState in effect)
  useEffect(() => {
    if (!connectError) return;

    const msg = (() => {
      const m = connectError.message ?? '';
      if (
        m.includes('User rejected') ||
        m.includes('User denied') ||
        m.includes('Connection request reset')
      ) {
        return 'Connection cancelled';
      }
      return 'Connection failed. Please try again.';
    })();

    let mounted = true;
    // schedule on next tick to avoid "set-state-in-effect" lint
    const micro = setTimeout(() => {
      if (mounted) setConnectionError(msg);
    }, 0);

    const timer = setTimeout(() => {
      if (mounted) setConnectionError(null);
    }, 3000);

    return () => {
      mounted = false;
      clearTimeout(timer);
      clearTimeout(micro);
    };
  }, [connectError]);

  const handleConnect = async (connector: (typeof connectors)[0]) => {
    setConnectionError(null);
    setShowConnectors(false);
    try {
      await connect({ connector });
    } catch {
      // handled by effect above
    }
  };

  const handleToggle = () => {
    setShowConnectors((s) => !s);
  };

  // Pending state
  if (status === 'connecting' || status === 'reconnecting') {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg px-4 py-2">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-white animate-spin" />
            <span className="text-white text-sm">Connecting...</span>
          </div>
        </div>
      </div>
    );
    }

  // Connected inside Farcaster
  if (address && isInFarcaster) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white font-mono text-sm">
              {farcasterUsername ? `@${farcasterUsername}` : `${address.slice(0, 6)}...${address.slice(-4)}`}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Normal web: connectors dropdown
  if (!isInFarcaster) {
    return (
      <div className="fixed top-4 right-4 z-50">
        {address ? (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg px-4 py-2">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white font-mono text-sm">
                {`${address.slice(0, 6)}...${address.slice(-4)}`}
              </span>
              <button
                onClick={() => disconnect()}
                className="text-white/70 hover:text-white transition-colors"
                title="Disconnect"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="relative" ref={dropdownRef}>
            <Button
              onClick={handleToggle}
              disabled={isPending}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold shadow-lg"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                  <ChevronDown
                    className={`w-4 h-4 ml-2 transition-transform ${showConnectors ? 'rotate-180' : ''}`}
                  />
                </>
              )}
            </Button>

            {showConnectors && !isPending && connectors.length > 0 && (
              <div className="absolute top-full right-0 mt-2 bg-white backdrop-blur-md border border-gray-200 rounded-lg shadow-xl p-2 min-w-[220px] max-h-[400px] overflow-y-auto">
                <div className="space-y-1">
                  {connectors.map((connector) => (
                    <button
                      key={connector.id}
                      onClick={() => handleConnect(connector)}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors text-gray-900 font-medium flex items-center gap-3 border border-transparent hover:border-blue-200"
                    >
                      <Wallet className="w-5 h-5 text-blue-600" />
                      <span>{connector.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {connectionError && (
              <div className="absolute top-full right-0 mt-2 bg-red-500/90 backdrop-blur-md text-white px-4 py-2 rounded-lg shadow-lg text-sm">
                {connectionError}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
}