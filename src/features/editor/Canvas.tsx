import React, { useEffect, useRef } from "react";
import { useCanvas } from "../../hooks/useCanvas";
import { useCanvasContext } from "../../context/CanvasContext";
import "./Canvas.css";

const CanvasComponent: React.FC = () => {
  const { canvasRef, fabricCanvas } = useCanvas();
  const { setCanvas } = useCanvasContext();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCanvas(fabricCanvas);
  }, [fabricCanvas, setCanvas]);

  useEffect(() => {
    if (!fabricCanvas || !containerRef.current) return;

    // Keyboard delete support
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        const activeObjects = fabricCanvas.getActiveObjects();

        // Don't delete if we are editing text
        const isEditing = activeObjects.some((obj) => (obj as any).isEditing);

        if (activeObjects.length && !isEditing) {
          fabricCanvas.remove(...activeObjects);
          fabricCanvas.discardActiveObject();
          fabricCanvas.requestRenderAll();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [fabricCanvas]);

  return (
    <div className="canvas-container" ref={containerRef}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default CanvasComponent;
