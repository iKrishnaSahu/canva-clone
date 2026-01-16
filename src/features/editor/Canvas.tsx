import { useRef, useEffect } from "react";
import { useCanvas } from "../../hooks/useCanvas";
import { useCanvasContext } from "../../context/CanvasContext";
import { FabricImage } from "fabric";
import { addImageToFrame } from "../collage/collageUtils";
import "./Canvas.css";

const CanvasComponent: React.FC = () => {
  const { canvasRef, fabricCanvas } = useCanvas();
  const { setCanvas } = useCanvasContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeFrameRef = useRef<any>(null);

  useEffect(() => {
    setCanvas(fabricCanvas);
  }, [fabricCanvas, setCanvas]);

  useEffect(() => {
    if (!fabricCanvas) return;

    const handleDblClick = (e: any) => {
      // Double click on valid frame -> open file picker
      const target = e.target;
      if (!target) return;
      const frame = e.subTargets?.[0] || target;
      if (frame && (frame as any).isFrame) {
        activeFrameRef.current = frame;
        fileInputRef.current?.click();
      }
    };

    fabricCanvas.on("mouse:dblclick", handleDblClick);

    return () => {
      fabricCanvas.off("mouse:dblclick", handleDblClick);
    };
  }, [fabricCanvas]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fabricCanvas || !activeFrameRef.current) return;

    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target?.result as string;
      FabricImage.fromURL(data).then((img) => {
        // Pass the active frame
        addImageToFrame(fabricCanvas, activeFrameRef.current, img);
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  useEffect(() => {
    if (!fabricCanvas || !containerRef.current) return;

    // Keyboard delete support
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        const activeObjects = fabricCanvas.getActiveObjects();
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
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default CanvasComponent;
