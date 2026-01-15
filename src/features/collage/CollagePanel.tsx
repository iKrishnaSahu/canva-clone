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

  const handleTemplateClick = (template: GridLayout) => {
    if (canvas) {
      addGridToCanvas(canvas, template);
      // Optional: onClose();
    }
  };

  const resizeCanvas = (width: number, height: number) => {
    if (!canvas) return;
    canvas.setDimensions({ width, height });

    // Also update the wrapper if possible, or assume wrapper fits content?
    // The wrapper .canvas-wrapper has fixed 800x600 via CSS typically.
    // We should probably update the DOM element style too if needed, but Fabric usually handles canvas element.
    // However, the parent container might wrap it.
    // Let's rely on Fabric for now, but we might need to notify users to zoom out/in.

    const wrapper = canvas.getElement().parentElement;
    if (wrapper) {
      wrapper.style.width = `${width}px`;
      wrapper.style.height = `${height}px`;
    }

    canvas.requestRenderAll();
  };

  const formats = [
    { label: "Square (1:1)", width: 600, height: 600 },
    { label: "Portrait (4:5)", width: 480, height: 600 },
    { label: "Landscape (1.91:1)", width: 600, height: 315 },
    { label: "Story (9:16)", width: 360, height: 640 },
  ];

  if (!isOpen) return null;

  return (
    <div className="collage-panel">
      <div className="collage-header">
        <h3>Layouts</h3>
        <button onClick={onClose}>&times;</button>
      </div>

      <div className="format-selector" style={{ padding: "0 10px 10px" }}>
        <label
          style={{
            display: "block",
            marginBottom: 5,
            color: "#ccc",
            fontSize: "0.8rem",
          }}
        >
          Canvas Format
        </label>
        <select
          style={{
            width: "100%",
            padding: 5,
            background: "#333",
            color: "#fff",
            border: "1px solid #444",
            borderRadius: 4,
          }}
          onChange={(e) => {
            const fmt = formats.find((f) => f.label === e.target.value);
            if (fmt) resizeCanvas(fmt.width, fmt.height);
          }}
        >
          {formats.map((f) => (
            <option key={f.label} value={f.label}>
              {f.label}
            </option>
          ))}
        </select>
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
