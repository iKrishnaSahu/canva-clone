import React from "react";
import CanvasComponent from "../features/editor/Canvas";
import FloatingActionBar from "../features/editor/FloatingActionBar";
import "./Workspace.css";

const Workspace: React.FC = () => {
  return (
    <main className="app-workspace">
      <div className="canvas-wrapper">
        <CanvasComponent />
        <FloatingActionBar />
      </div>
    </main>
  );
};

export default Workspace;
