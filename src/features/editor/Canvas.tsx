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
    // Resize logic placeholder
  }, [fabricCanvas]);

  return (
    <div className="canvas-container" ref={containerRef}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default CanvasComponent;
