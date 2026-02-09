export type GlitchEffect = {
  id: string;
  name: string;
  apply: (imageData: ImageData, intensity: number) => ImageData;
};

export const glitchEffects: Record<string, GlitchEffect> = {
  rgbSplit: {
    id: 'rgbSplit',
    name: 'RGB Split',
    apply: (imageData: ImageData, intensity: number): ImageData => {
      const data = new Uint8ClampedArray(imageData.data);
      const offset = Math.floor(intensity * 20);
      
      for (let i = 0; i < data.length; i += 4) {
        const redIndex = Math.max(0, i - offset * 4);
        const blueIndex = Math.min(data.length - 4, i + offset * 4);
        
        data[i] = imageData.data[redIndex];
        data[i + 2] = imageData.data[blueIndex + 2];
      }
      
      return new ImageData(data, imageData.width, imageData.height);
    },
  },
  
  scanLines: {
    id: 'scanLines',
    name: 'Scan Lines',
    apply: (imageData: ImageData, intensity: number): ImageData => {
      const data = new Uint8ClampedArray(imageData.data);
      const lineSpacing = Math.max(2, Math.floor(8 - intensity * 6));
      
      for (let y = 0; y < imageData.height; y++) {
        if (y % lineSpacing === 0) {
          for (let x = 0; x < imageData.width; x++) {
            const i = (y * imageData.width + x) * 4;
            data[i] = data[i] * 0.3;
            data[i + 1] = data[i + 1] * 0.3;
            data[i + 2] = data[i + 2] * 0.3;
          }
        }
      }
      
      return new ImageData(data, imageData.width, imageData.height);
    },
  },
  
  vhsDistortion: {
    id: 'vhsDistortion',
    name: 'VHS Distortion',
    apply: (imageData: ImageData, intensity: number): ImageData => {
      const data = new Uint8ClampedArray(imageData.data);
      // Compress range so 12-15% reaches maximum effect (same as corruption)
      // Scale intensity by ~7.7x and cap at 1.0
      const scaledIntensity = Math.min(1.0, intensity * 7.7);
      const maxShift = Math.floor(scaledIntensity * 30);
      
      for (let y = 0; y < imageData.height; y++) {
        const shift = Math.floor((Math.random() * 2 - 1) * maxShift);
        
        for (let x = 0; x < imageData.width; x++) {
          const srcX = Math.max(0, Math.min(imageData.width - 1, x + shift));
          const srcI = (y * imageData.width + srcX) * 4;
          const destI = (y * imageData.width + x) * 4;
          
          data[destI] = imageData.data[srcI];
          data[destI + 1] = imageData.data[srcI + 1];
          data[destI + 2] = imageData.data[srcI + 2];
          data[destI + 3] = imageData.data[srcI + 3];
        }
      }
      
      return new ImageData(data, imageData.width, imageData.height);
    },
  },
  
  chromaticAberration: {
    id: 'chromaticAberration',
    name: 'Chromatic Aberration',
    apply: (imageData: ImageData, intensity: number): ImageData => {
      const data = new Uint8ClampedArray(imageData.data);
      const offset = Math.floor(intensity * 15);
      
      for (let i = 0; i < data.length; i += 4) {
        const redIndex = Math.max(0, i - offset * 4);
        const greenIndex = i;
        const blueIndex = Math.min(data.length - 4, i + offset * 4);
        
        data[i] = imageData.data[redIndex];
        data[i + 1] = imageData.data[greenIndex + 1];
        data[i + 2] = imageData.data[blueIndex + 2];
      }
      
      return new ImageData(data, imageData.width, imageData.height);
    },
  },
  
  digitalCorruption: {
    id: 'digitalCorruption',
    name: 'Digital Corruption',
    apply: (imageData: ImageData, intensity: number): ImageData => {
      const data = new Uint8ClampedArray(imageData.data);
      // Compress range so 12-15% reaches maximum effect
      // Scale intensity by ~7.7x and cap at 1.0
      const scaledIntensity = Math.min(1.0, intensity * 7.7);
      const corruptionChance = scaledIntensity * 0.05;
      
      for (let i = 0; i < data.length; i += 4) {
        if (Math.random() < corruptionChance) {
          data[i] = Math.floor(Math.random() * 256);
          data[i + 1] = Math.floor(Math.random() * 256);
          data[i + 2] = Math.floor(Math.random() * 256);
        }
      }
      
      return new ImageData(data, imageData.width, imageData.height);
    },
  },
  
  colorShift: {
    id: 'colorShift',
    name: 'Color Shift',
    apply: (imageData: ImageData, intensity: number): ImageData => {
      const data = new Uint8ClampedArray(imageData.data);
      const hueShift = intensity * 180;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = imageData.data[i] / 255;
        const g = imageData.data[i + 1] / 255;
        const b = imageData.data[i + 2] / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;
        const s = max === 0 ? 0 : (max - min) / max;
        const v = max;
        
        if (max !== min) {
          if (max === r) {
            h = ((g - b) / (max - min)) % 6;
          } else if (max === g) {
            h = (b - r) / (max - min) + 2;
          } else {
            h = (r - g) / (max - min) + 4;
          }
          h = h * 60;
          if (h < 0) h += 360;
        }
        
        h = (h + hueShift) % 360;
        
        const c = v * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = v - c;
        
        let rPrime = 0;
        let gPrime = 0;
        let bPrime = 0;
        
        if (h < 60) {
          rPrime = c;
          gPrime = x;
        } else if (h < 120) {
          rPrime = x;
          gPrime = c;
        } else if (h < 180) {
          gPrime = c;
          bPrime = x;
        } else if (h < 240) {
          gPrime = x;
          bPrime = c;
        } else if (h < 300) {
          rPrime = x;
          bPrime = c;
        } else {
          rPrime = c;
          bPrime = x;
        }
        
        data[i] = Math.round((rPrime + m) * 255);
        data[i + 1] = Math.round((gPrime + m) * 255);
        data[i + 2] = Math.round((bPrime + m) * 255);
      }
      
      return new ImageData(data, imageData.width, imageData.height);
    },
  },
  
  glitchBars: {
    id: 'glitchBars',
    name: 'Glitch Bars',
    apply: (imageData: ImageData, intensity: number): ImageData => {
      const data = new Uint8ClampedArray(imageData.data);
      const barCount = Math.floor(intensity * 10);
      
      for (let i = 0; i < barCount; i++) {
        const y = Math.floor(Math.random() * imageData.height);
        const height = Math.floor(Math.random() * 20) + 5;
        const shift = Math.floor((Math.random() * 2 - 1) * intensity * 50);
        
        for (let dy = 0; dy < height && y + dy < imageData.height; dy++) {
          for (let x = 0; x < imageData.width; x++) {
            const srcX = Math.max(0, Math.min(imageData.width - 1, x + shift));
            const srcI = ((y + dy) * imageData.width + srcX) * 4;
            const destI = ((y + dy) * imageData.width + x) * 4;
            
            data[destI] = imageData.data[srcI];
            data[destI + 1] = imageData.data[srcI + 1];
            data[destI + 2] = imageData.data[srcI + 2];
          }
        }
      }
      
      return new ImageData(data, imageData.width, imageData.height);
    },
  },
  
  bitCrush: {
    id: 'bitCrush',
    name: 'Bit Crush',
    apply: (imageData: ImageData, intensity: number): ImageData => {
      const data = new Uint8ClampedArray(imageData.data);
      const levels = Math.max(2, Math.floor(256 - intensity * 250));
      
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.floor(imageData.data[i] / levels) * levels;
        data[i + 1] = Math.floor(imageData.data[i + 1] / levels) * levels;
        data[i + 2] = Math.floor(imageData.data[i + 2] / levels) * levels;
      }
      
      return new ImageData(data, imageData.width, imageData.height);
    },
  },
  
};
// Add a real high-level function that matches what page.tsx expects
export async function applyGlitchEffect(
  imageBase64: string,
  effectId: string,
  intensity: number,
  canvas: HTMLCanvasElement
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const effect = glitchEffects[effectId];
      if (!effect) {
        reject(new Error(`Unknown glitch effect: ${effectId}`));
        return;
      }

      // Apply the selected glitch effect
      const output = effect.apply(imageData, intensity);

      ctx.putImageData(output, 0, 0);

      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = (e) => reject(e);

    img.src = imageBase64;
  });
}