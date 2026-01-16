import React from "react";
import { useCanvasContext } from "../../context/CanvasContext";
import { IText } from "fabric";
import "../collage/CollagePanel.css"; // Reuse existing styles for consistency

interface TextPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const TextPanel: React.FC<TextPanelProps> = ({ isOpen, onClose }) => {
  const { canvas } = useCanvasContext();

  const addText = (text: string, options: Partial<IText>) => {
    if (!canvas) return;
    const textObj = new IText(text, {
      left: 100,
      top: 100,
      fontFamily: "Arial",
      fill: "#333",
      ...options,
    });
    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    canvas.requestRenderAll();
  };

  if (!isOpen) return null;

  return (
    <div className="collage-panel">
      <div className="collage-header">
        <h3>Text</h3>
        <button onClick={onClose}>&times;</button>
      </div>

      <div
        style={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <button
          className="text-btn big"
          style={{ fontSize: "24px", fontWeight: "bold", padding: "15px" }}
          onClick={() =>
            addText("Add a heading", { fontSize: 32, fontWeight: "bold" })
          }
        >
          Add a heading
        </button>
        <button
          className="text-btn medium"
          style={{ fontSize: "18px", fontWeight: "bold", padding: "12px" }}
          onClick={() =>
            addText("Add a subheading", { fontSize: 24, fontWeight: "bold" })
          }
        >
          Add a subheading
        </button>
        <button
          className="text-btn small"
          style={{ fontSize: "14px", padding: "10px" }}
          onClick={() =>
            addText("Add a little bit of body text", { fontSize: 18 })
          }
        >
          Add a little bit of body text
        </button>
      </div>
    </div>
  );
};

export default TextPanel;
