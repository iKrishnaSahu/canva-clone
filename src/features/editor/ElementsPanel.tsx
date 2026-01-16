import React from "react";
import { useCanvasContext } from "../../context/CanvasContext";
import { Rect, Circle, Triangle, Line } from "fabric";
import "../collage/CollagePanel.css"; // Reuse styles

interface ElementsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ElementsPanel: React.FC<ElementsPanelProps> = ({ isOpen, onClose }) => {
  const { canvas } = useCanvasContext();

  const addShape = (type: "rect" | "circle" | "triangle" | "line") => {
    if (!canvas) return;

    let shape;
    const commonOpts = { left: 100, top: 100, fill: "#555" };

    switch (type) {
      case "rect":
        shape = new Rect({ ...commonOpts, width: 100, height: 100 });
        break;
      case "circle":
        shape = new Circle({ ...commonOpts, radius: 50 });
        break;
      case "triangle":
        shape = new Triangle({ ...commonOpts, width: 100, height: 100 });
        break;
      case "line":
        shape = new Line([50, 50, 200, 50], {
          ...commonOpts,
          stroke: "#555",
          strokeWidth: 5,
        });
        break;
    }

    if (shape) {
      canvas.add(shape);
      canvas.setActiveObject(shape);
      canvas.requestRenderAll();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="collage-panel">
      <div className="collage-header">
        <h3>Elements</h3>
        <button onClick={onClose}>&times;</button>
      </div>

      <div
        style={{
          padding: "20px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
        }}
      >
        <button
          style={{
            height: "80px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => addShape("rect")}
        >
          <div
            style={{
              width: 30,
              height: 30,
              background: "#555",
              marginBottom: 5,
            }}
          ></div>
          Square
        </button>
        <button
          style={{
            height: "80px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => addShape("circle")}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "#555",
              marginBottom: 5,
            }}
          ></div>
          Circle
        </button>
        <button
          style={{
            height: "80px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => addShape("triangle")}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "15px solid transparent",
              borderRight: "15px solid transparent",
              borderBottom: "30px solid #555",
              marginBottom: 5,
            }}
          ></div>
          Triangle
        </button>
        <button
          style={{
            height: "80px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => addShape("line")}
        >
          <div
            style={{
              width: 30,
              height: 2,
              background: "#555",
              marginBottom: 5,
            }}
          ></div>
          Line
        </button>
      </div>
    </div>
  );
};

export default ElementsPanel;
