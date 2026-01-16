import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Workspace from "./Workspace";
import Toolbar from "../features/editor/Toolbar";
import CollagePanel from "../features/collage/CollagePanel";
import TextPanel from "../features/editor/TextPanel"; // Import TextPanel
import ElementsPanel from "../features/editor/ElementsPanel"; // Import ElementsPanel
import "./Layout.css";

const Layout: React.FC = () => {
  const [activePanel, setActivePanel] = useState<string | null>(null);

  const closePanel = () => setActivePanel(null);

  return (
    <div className="layout-container">
      <Header />
      <Toolbar />
      <div className="main-content">
        <Sidebar activePanel={activePanel} onPanelChange={setActivePanel} />

        {/* Panels */}
        <CollagePanel isOpen={activePanel === "collage"} onClose={closePanel} />
        <TextPanel isOpen={activePanel === "text"} onClose={closePanel} />
        <ElementsPanel
          isOpen={activePanel === "elements"}
          onClose={closePanel}
        />

        <Workspace />
      </div>
    </div>
  );
};

export default Layout;
