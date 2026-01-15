import React from "react";
import CanvasComponent from "../features/editor/Canvas";
import "./Workspace.css";

const Workspace: React.FC = () => {
  return (
    <main className="app-workspace">
      <div className="canvas-wrapper">
        <CanvasComponent />
      </div>
    </main>
  );
};

export default Workspace;
