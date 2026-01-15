import { useState, useEffect } from 'react';
import { Canvas, FabricObject } from 'fabric';

export const useObjectPosition = (canvas: Canvas | null, selectedObject: FabricObject | null) => {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!canvas || !selectedObject) {
      setPosition(null);
      return;
    }

    const updatePosition = () => {
      if (!selectedObject || !canvas) return;

      const bound = selectedObject.getBoundingRect();

      const MENU_HEIGHT = 60; // Approximate height of FAB + padding
      const MENU_WIDTH = 100; // Approximate width (icon + padding)
      const OFFSET = 10;

      let top = bound.top - MENU_HEIGHT - OFFSET; // Default: Place above

      // Check collision with top edge
      if (top < 0) {
        // Flip to below
        top = bound.top + bound.height + OFFSET;
      }

      // Calculate Horizontal Center
      let left = bound.left + (bound.width / 2);

      // Horizontal Boundary Check (Clamp)
      const canvasWidth = canvas.width || 800;
      const minLeft = (MENU_WIDTH / 2) + OFFSET;
      const maxLeft = canvasWidth - (MENU_WIDTH / 2) - OFFSET;

      if (left < minLeft) left = minLeft;
      if (left > maxLeft) left = maxLeft;

      setPosition({
        top: top,
        left: left
      });
    };

    updatePosition();

    canvas.on('object:modified', updatePosition);
    canvas.on('object:moving', updatePosition);
    canvas.on('object:scaling', updatePosition);
    canvas.on('object:rotating', updatePosition);

    return () => {
      canvas.off('object:modified', updatePosition);
      canvas.off('object:moving', updatePosition);
      canvas.off('object:scaling', updatePosition);
      canvas.off('object:rotating', updatePosition);
    };
  }, [canvas, selectedObject]);

  return position;
};
