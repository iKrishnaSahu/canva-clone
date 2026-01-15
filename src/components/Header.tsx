import React from "react";
import { useCanvasContext } from "../context/CanvasContext";
import "./Header.css";

const Header: React.FC = () => {
  const { canvas } = useCanvasContext();

  const handleExport = () => {
    if (canvas) {
      const dataURL = canvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 2,
      });
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "canvas-design.png";
      link.click();
    }
  };

  const handleSave = () => {
    if (canvas) {
      const json = JSON.stringify(canvas.toJSON());
      localStorage.setItem("canvas-design", json);
      alert("Saved to localStorage");
    }
  };

  const handleLoad = () => {
    if (canvas) {
      const json = localStorage.getItem("canvas-design");
      if (json) {
        canvas.loadFromJSON(JSON.parse(json)).then(() => {
          canvas.requestRenderAll();
        });
      }
    }
  };

  const handleSaveFile = () => {
    if (canvas) {
      const json = JSON.stringify(canvas.toJSON());
      const blob = new Blob([json], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "project.json";
      link.click();
    }
  };

  const handleLoadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvas) return;
    const reader = new FileReader();
    reader.onload = (f) => {
      const json = f.target?.result as string;
      canvas
        .loadFromJSON(JSON.parse(json))
        .then(() => canvas.requestRenderAll());
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <header className="app-header">
      <div className="logo">CanvaClone</div>
      <div className="actions">
        <button className="btn-secondary" onClick={handleSave}>
          Quick Save
        </button>
        <button className="btn-secondary" onClick={handleLoad}>
          Quick Load
        </button>
        <button className="btn-secondary" onClick={handleSaveFile}>
          Save Project
        </button>
        <label className="btn-secondary">
          Open Project
          <input
            type="file"
            accept=".json"
            onChange={handleLoadFile}
            style={{ display: "none" }}
          />
        </label>
        <button className="btn-primary" onClick={handleExport}>
          Export PNG
        </button>
      </div>
    </header>
  );
};

export default Header;
