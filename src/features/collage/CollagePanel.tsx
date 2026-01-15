import React from "react";
import { useCanvasContext } from "../../context/CanvasContext";
import { GRID_TEMPLATES } from "./gridTemplates";
import type { GridLayout } from "./gridTemplates";
import { addGridToCanvas } from "./collageUtils";
import "./CollagePanel.css";

interface CollagePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const CollagePanel: React.FC<CollagePanelProps> = ({ isOpen, onClose }) => {
  const { canvas } = useCanvasContext();

  if (!isOpen) return null;

  const handleTemplateClick = (template: GridLayout) => {
    if (canvas) {
      addGridToCanvas(canvas, template);
      // Optional: onClose();
    }
  };

  return (
    <div className="collage-panel">
      <div className="collage-header">
        <h3>Layouts</h3>
        <button onClick={onClose}>&times;</button>
      </div>
      <div className="templates-grid">
        {GRID_TEMPLATES.map((tpl, idx) => (
          <div
            key={idx}
            className="template-verify-item"
            onClick={() => handleTemplateClick(tpl)}
            title={tpl.name}
          >
            <div
              className="mini-grid"
              style={{ position: "relative", width: "60px", height: "60px" }}
            >
              {tpl.frames.map((f, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: `${(f.left / 400) * 100}%`,
                    top: `${(f.top / 400) * 100}%`,
                    width: `${(f.width / 400) * 100}%`,
                    height: `${(f.height / 400) * 100}%`,
                    background: "#ccc",
                    border: "1px solid #fff",
                  }}
                ></div>
              ))}
            </div>
            <span>{tpl.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollagePanel;
