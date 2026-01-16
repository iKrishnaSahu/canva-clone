import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Workspace from "./Workspace";
import Toolbar from "../features/editor/Toolbar";
import CollagePanel from "../features/collage/CollagePanel";
import TextPanel from "../features/editor/TextPanel"; // Import TextPanel
import ElementsPanel from "../features/editor/ElementsPanel"; // Import ElementsPanel
import { Box } from "@mui/material";
// import "./Layout.css"; // Removing CSS import as we use MUI Box

const Layout: React.FC = () => {
  const [activePanel, setActivePanel] = useState<string | null>(null);

  const closePanel = () => setActivePanel(null);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <Header />
      <Toolbar />
      <Box
        sx={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Sidebar activePanel={activePanel} onPanelChange={setActivePanel} />

        {/* Panels - they will need to be refactored to fit into MUI flow or keep absolute logic */}
        <CollagePanel isOpen={activePanel === "collage"} onClose={closePanel} />
        <TextPanel isOpen={activePanel === "text"} onClose={closePanel} />
        <ElementsPanel
          isOpen={activePanel === "elements"}
          onClose={closePanel}
        />

        <Workspace />
      </Box>
    </Box>
  );
};

export default Layout;
