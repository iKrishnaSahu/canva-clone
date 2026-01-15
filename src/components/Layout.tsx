import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Workspace from "./Workspace";
import Toolbar from "../features/editor/Toolbar";
import CollagePanel from "../features/collage/CollagePanel";
import "./Layout.css";

const Layout: React.FC = () => {
  const [isCollagePanelOpen, setIsCollagePanelOpen] = useState(false);

  const toggleCollagePanel = () => {
    setIsCollagePanelOpen(!isCollagePanelOpen);
  };

  return (
    <div className="layout-container">
      <Header />
      <Toolbar />
      <div className="main-content">
        <Sidebar onCollageClick={toggleCollagePanel} />
        <CollagePanel
          isOpen={isCollagePanelOpen}
          onClose={() => setIsCollagePanelOpen(false)}
        />
        <Workspace />
      </div>
    </div>
  );
};

export default Layout;
