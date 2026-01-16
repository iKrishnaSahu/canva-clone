import { useEffect, useRef, useState } from 'react';
import { Canvas } from 'fabric';

export const useCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Fabric Canvas
    // Note: In Fabric v6/v7, new Canvas() is correct.
    const canvas = new Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
    });

    setFabricCanvas(canvas);
    (window as any).fabricCanvas = canvas;

    return () => {
      canvas.dispose();
    };
  }, []);

  return { canvasRef, fabricCanvas };
};
