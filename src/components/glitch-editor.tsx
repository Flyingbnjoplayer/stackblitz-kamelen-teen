'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { glitchEffects } from '@/lib/glitch-effects';
import { Button } from './ui/button';
import { Upload, Camera, Check, X } from 'lucide-react';
import { CameraModal } from './camera-modal';
import type { EffectState } from './glitch-controls';

export type GlitchEditorProps = {
  effectStates: EffectState;
  onImageProcessed: (dataUrl: string) => void;
  onImageLoaded?: (hasImage: boolean) => void;
  resetTrigger?: number;
  initialImageUrl?: string; // Support loading image from URL
};

export function GlitchEditor({ effectStates, onImageProcessed, onImageLoaded, resetTrigger, initialImageUrl }: GlitchEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [originalImage, setOriginalImage] = useState<ImageData | null>(null);
  const [hasImage, setHasImage] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  // Load initial image from URL if provided
  useEffect(() => {
    const loadInitialImage = async (): Promise<void> => {
      if (!initialImageUrl || hasImage) return;
      
      console.log('Loading initial image from URL:', initialImageUrl);
      setIsLoadingImage(true);
      
      try {
        const response = await fetch(initialImageUrl);
        if (!response.ok) throw new Error('Failed to fetch image');
        
        const blob = await response.blob();
        const file = new File([blob], 'glitch-art.png', { type: blob.type });
        loadImageToEditor(file);
      } catch (error) {
        console.error('Failed to load initial image:', error);
        setIsLoadingImage(false);
      }
    };
    
    loadInitialImage();
  }, [initialImageUrl]);

  useEffect(() => {
    if (resetTrigger !== undefined && resetTrigger > 0) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      setOriginalImage(null);
      setHasImage(false);
      setIsCameraOpen(false);
      setPreviewFile(null);
      setPreviewUrl(null);
      setIsLoadingImage(false);
      
      console.log('Editor reset triggered');
    }
  }, [resetTrigger, previewUrl]);

  const processImage = useCallback((): void => {
    if (!canvasRef.current || !originalImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let imageData = new ImageData(
      new Uint8ClampedArray(originalImage.data),
      originalImage.width,
      originalImage.height
    );

    Object.entries(effectStates).forEach(([effectId, intensity]) => {
      if (intensity > 0) {
        const effect = glitchEffects[effectId];
        if (effect) {
          imageData = effect.apply(imageData, intensity);
        }
      }
    });

    ctx.putImageData(imageData, 0, 0);
    
    const dataUrl = canvas.toDataURL('image/png');
    onImageProcessed(dataUrl);
  }, [originalImage, effectStates, onImageProcessed]);

  useEffect(() => {
    processImage();
  }, [processImage]);

  const loadImageToEditor = (file: File): void => {
    if (!file) {
      console.error('No file provided');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      console.error('Invalid file type:', file.type);
      return;
    }

    console.log('Loading image file:', file.name, file.size);
    
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>): void => {
      const result = e.target?.result;
      if (!result || typeof result !== 'string') {
        console.error('Failed to read file result');
        return;
      }

      console.log('FileReader loaded, creating image element');
      const img = new Image();
      img.onload = (): void => {
        console.log('Image loaded successfully:', img.width, 'x', img.height);
        const canvas = canvasRef.current;
        if (!canvas) {
          console.error('Canvas ref not available');
          return;
        }

        const maxWidth = 1200;
        const maxHeight = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.error('Failed to get canvas context');
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        setOriginalImage(imageData);
        setHasImage(true);
        setIsLoadingImage(false);
        onImageLoaded?.(true);
        
        console.log('Image set successfully in editor');
      };

      img.onerror = (error): void => {
        console.error('Failed to load image:', error);
        setIsLoadingImage(false);
      };

      img.src = result;
    };

    reader.onerror = (error): void => {
      console.error('Failed to read file:', error);
      setIsLoadingImage(false);
    };

    reader.readAsDataURL(file);
  };

  const handleFileSelect = (file: File): void => {
    setPreviewFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleCameraCapture = (file: File): void => {
    console.log('Camera capture received, loading image directly');
    setIsLoadingImage(true);
    loadImageToEditor(file);
  };

  const handleConfirmImage = (): void => {
    console.log('Confirm button clicked, previewFile:', previewFile ? 'exists' : 'null');
    if (previewFile) {
      const fileToLoad = previewFile;
      console.log('Loading file:', fileToLoad.name, fileToLoad.size, 'bytes');
      setIsLoadingImage(true);
      
      // Clean up preview
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewFile(null);
      setPreviewUrl(null);
      
      // Load the image with a small delay to ensure state updates
      setTimeout(() => {
        loadImageToEditor(fileToLoad);
      }, 50);
    } else {
      console.error('No preview file available to confirm');
    }
  };

  const handleCancelImage = (): void => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewFile(null);
    setPreviewUrl(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    console.log('File selected from input:', file ? `${file.name} (${file.size} bytes, ${file.type})` : 'none');
    
    if (file && file.type.startsWith('image/')) {
      console.log('Valid image file, setting preview');
      handleFileSelect(file);
    } else if (file) {
      console.error('Invalid file type selected:', file.type);
      alert('Please select an image file (JPG, PNG, GIF, etc.)');
    }
    
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = (): void => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full space-y-4">
      <div className="relative w-full aspect-square bg-black/30 backdrop-blur-sm rounded-lg overflow-hidden border-2 border-white/20 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain"
          style={{ display: hasImage ? 'block' : 'none' }}
        />
        
        {!hasImage && (
          <>
            {isLoadingImage ? (
              <div className="text-center space-y-4 p-8">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto"></div>
                <p className="text-white text-lg">Loading your image...</p>
              </div>
            ) : previewUrl ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 space-y-4">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-w-full max-h-[60%] object-contain rounded-lg"
                />
                <div className="text-center space-y-4">
                  <p className="text-white text-lg font-semibold">
                    Use this image?
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={handleConfirmImage}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-base font-bold border-2 border-white/20"
                      type="button"
                    >
                      <Check className="w-5 h-5 mr-2" />
                      <span className="font-bold text-white">Yes</span>
                    </Button>
                    <Button
                      onClick={handleCancelImage}
                      variant="outline"
                      className="border-2 border-white bg-white/20 hover:bg-white/30 text-white px-8 py-6 text-base font-bold shadow-lg"
                      type="button"
                    >
                      <X className="w-5 h-5 mr-2" />
                      <span className="font-bold text-white drop-shadow-lg">Cancel</span>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4 p-8">
                <p className="text-white text-lg">Upload or capture an image to start! 📸</p>
                <div className="flex gap-4 justify-center flex-col sm:flex-row">
                  <Button
                    onClick={handleUploadClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-bold border-2 border-white/20"
                    type="button"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    <span className="font-bold text-white">Upload Image</span>
                  </Button>
                  <Button
                    onClick={() => setIsCameraOpen(true)}
                    variant="outline"
                    className="border-white bg-white/20 hover:bg-white/30 text-white py-6 text-base font-bold"
                    type="button"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    <span className="font-bold text-white">Use Camera</span>
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
}
