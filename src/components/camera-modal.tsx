'use client';

import { useRef, useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Camera, X, SwitchCamera } from 'lucide-react';

export type CameraModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
};

export function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [lastTapTime, setLastTapTime] = useState<number>(0);
  const lastTapTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);



  const startCamera = async (): Promise<void> => {
    try {
      setError(null);
      console.log('Starting camera with facing mode:', facingMode);
      
      // Stop existing stream before starting new one
      if (stream) {
        console.log('Stopping existing stream');
        stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      console.log('Camera stream obtained successfully');
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        console.log('Video element playing, dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = (): void => {
    if (stream) {
      stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = async (): Promise<void> => {
    console.log('Capture button/double-tap triggered');
    if (!videoRef.current) {
      console.error('Video ref not available');
      return;
    }

    console.log('Video dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
    
    if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
      console.error('Video not ready - dimensions are 0');
      setError('Camera not ready. Please wait a moment and try again.');
      return;
    }

    setIsCapturing(true);
    
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Failed to get canvas context');
        setIsCapturing(false);
        return;
      }

      console.log('Drawing image to canvas');
      ctx.drawImage(videoRef.current, 0, 0);

      // Convert to blob using Promise wrapper for better control
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/png');
      });

      if (blob) {
        console.log('Photo captured successfully, blob size:', blob.size);
        const file = new File([blob], `camera-${Date.now()}.png`, { type: 'image/png' });
        
        // Call onCapture and wait a bit to ensure state updates
        console.log('Passing file to editor...');
        onCapture(file);
        
        // Small delay to ensure file is passed before closing
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('Closing camera modal');
        stopCamera();
        onClose();
      } else {
        console.error('Failed to create blob from canvas');
        setError('Failed to capture photo. Please try again.');
      }
    } catch (error) {
      console.error('Capture error:', error);
      setError('Failed to capture photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const toggleCamera = (): void => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleVideoTap = (): void => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapTimeRef.current;
    
    console.log('Video tapped, time since last tap:', timeSinceLastTap);
    
    // Double-tap detected (within 300ms)
    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      console.log('Double-tap detected, capturing photo');
      capturePhoto();
      lastTapTimeRef.current = 0; // Reset to prevent triple-tap
      setLastTapTime(0);
    } else {
      console.log('First tap recorded');
      lastTapTimeRef.current = now;
      setLastTapTime(now);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="relative w-full h-full bg-black">
        {/* Top controls - Close and Flip buttons */}
        <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent">
          <Button
            onClick={toggleCamera}
            disabled={!stream || isCapturing || !!error}
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

        {/* Camera preview - Full screen */}
        <div className="absolute inset-0">
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center p-4 bg-black">
              <p className="text-red-400 text-center">{error}</p>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onTouchEnd={handleVideoTap}
              onClick={handleVideoTap}
              className="w-full h-full object-cover cursor-pointer"
            />
          )}
        </div>

        {/* Info text at bottom - double-tap to capture */}
        <div className="absolute bottom-0 left-0 right-0 z-20 flex justify-center items-center p-8 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
          <div className="bg-purple-600/90 backdrop-blur-sm text-white px-6 py-3 rounded-full shadow-lg">
            <p className="text-sm font-medium">Double-tap to capture</p>
          </div>
        </div>

      </div>
    </div>
  );
}
