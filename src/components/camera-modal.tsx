'use client';

import { useRef, useEffect, useState } from 'react';
import { Button } from './ui/button';
import { X, SwitchCamera } from 'lucide-react';

export type CameraModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
};

export function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const lastTapTimeRef = useRef<number>(0);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsReady(false);
  };

  const startCamera = async () => {
    try {
      setError(null);
      setIsReady(false);
      console.log('Starting camera with facing mode:', facingMode);

      // Stop existing stream
      stopCamera();

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      console.log('Camera stream obtained');
      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        console.log('Video playing');
      }
    } catch (err) {
      console.error('Camera access error:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera permission denied. Please allow camera access.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found.');
        } else if (err.name === 'NotReadableError') {
          setError('Camera is in use by another application.');
        } else {
          setError(`Camera error: ${err.message}`);
        }
      } else {
        setError('Could not access camera.');
      }
    }
  };

  // Start/stop camera when modal opens/closes or facing mode changes
  useEffect(() => {
    if (isOpen) {
      startCamera();
    }
    
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, facingMode]);

  const handleVideoReady = () => {
    if (videoRef.current && videoRef.current.videoWidth > 0) {
      console.log('Video ready:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
      setIsReady(true);
    }
  };

  const capturePhoto = async () => {
    console.log('Capture triggered');
    
    if (!videoRef.current || !isReady) {
      setError('Camera not ready. Please wait.');
      return;
    }

    if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
      setError('Camera not ready. Please wait.');
      return;
    }

    setIsCapturing(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsCapturing(false);
        return;
      }

      ctx.drawImage(videoRef.current, 0, 0);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/png');
      });

      if (blob) {
        console.log('Photo captured, size:', blob.size);
        const file = new File([blob], `camera-${Date.now()}.png`, { type: 'image/png' });
        onCapture(file);
        
        await new Promise(resolve => setTimeout(resolve, 100));
        stopCamera();
        onClose();
      } else {
        setError('Failed to capture photo.');
      }
    } catch (err) {
      console.error('Capture error:', err);
      setError('Failed to capture photo.');
    } finally {
      setIsCapturing(false);
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleVideoTap = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapTimeRef.current;

    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      capturePhoto();
      lastTapTimeRef.current = 0;
    } else {
      lastTapTimeRef.current = now;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="relative w-full h-full bg-black">
        {/* Top controls */}
        <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent">
          <Button
            onClick={toggleCamera}
            disabled={!isReady || isCapturing || !!error}
            variant="ghost"
            size="icon"
            className="rounded-full bg-black/50 hover:bg-black/70 text-white border border-purple-500/50"
          >
            <SwitchCamera className="w-6 h-6" />
          </Button>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white border border-purple-500/50"
            type="button"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Camera preview */}
        <div className="absolute inset-0">
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center p-4 bg-black">
              <div className="text-center">
                <p className="text-red-400 mb-4">{error}</p>
                <Button onClick={startCamera} variant="outline" className="text-white border-white">
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onLoadedData={handleVideoReady}
              onTouchEnd={handleVideoTap}
              onClick={handleVideoTap}
              className="w-full h-full object-cover cursor-pointer"
            />
          )}
        </div>

        {/* Loading indicator */}
        {!isReady && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4"></div>
              <p>Starting camera...</p>
            </div>
          </div>
        )}

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 z-20 flex justify-center items-center p-8 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
          <div className="bg-purple-600/90 backdrop-blur-sm text-white px-6 py-3 rounded-full shadow-lg">
            <p className="text-sm font-medium">
              {isReady ? 'Double-tap to capture' : 'Initializing...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}