import React, { useRef } from "react";
import {
  FaFont,
  FaShapes,
  FaImage,
  FaMousePointer,
  FaThLarge,
} from "react-icons/fa";
import { useCanvasContext } from "../context/CanvasContext";
import { FabricImage, Rect } from "fabric";
import { addImageToFrame } from "../features/collage/collageUtils";
import { Paper, Button, Typography, Box } from "@mui/material";

// import "./Sidebar.css"; // Removing custom CSS

interface SidebarProps {
  activePanel: string | null;
  onPanelChange: (panel: string | null) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePanel, onPanelChange }) => {
  const { canvas } = useCanvasContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target?.result as string;
      FabricImage.fromURL(data).then((img) => {
        const activeObject = canvas.getActiveObject();
        // We marked frames with isFrame = true
        if (
          activeObject &&
          "isFrame" in activeObject &&
          (activeObject as any).isFrame
        ) {
          addImageToFrame(canvas, activeObject as unknown as Rect, img);
        } else {
          img.set({
            left: 100,
            top: 100,
            scaleX: 0.5,
            scaleY: 0.5,
          });
          canvas.add(img);
          canvas.setActiveObject(img);
        }
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const togglePanel = (panel: string) => {
    if (activePanel === panel) {
      onPanelChange(null);
    } else {
      onPanelChange(panel);
    }
  };

  const SidebarButton = ({
    icon,
    label,
    isActive,
    onClick,
  }: {
    icon: React.ReactNode;
    label: string;
    isActive?: boolean;
    onClick: () => void;
  }) => (
    <Button
      variant={isActive ? "contained" : "text"}
      color={isActive ? "primary" : "inherit"}
      onClick={onClick}
      sx={{
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        width: "100%",
        py: 1.5,
        gap: 0.5,
        borderRadius: 2,
        "&:hover": { bgcolor: "action.hover" },
      }}
    >
      <Box sx={{ fontSize: 20, display: "flex" }}>{icon}</Box>
      <Typography variant="caption" sx={{ fontSize: "0.7rem", lineHeight: 1 }}>
        {label}
      </Typography>
    </Button>
  );

  return (
    <Paper
      square
      elevation={1}
      sx={{
        width: 80,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flexShrink: 0,
        zIndex: 100,
        borderRight: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*"
        onChange={handleImageUpload}
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          p: 1,
          gap: 1,
        }}
      >
        <SidebarButton
          label="Select"
          icon={<FaMousePointer />}
          isActive={!activePanel}
          onClick={() => onPanelChange(null)}
        />
        <SidebarButton
          label="Layouts"
          icon={<FaThLarge />}
          isActive={activePanel === "collage"}
          onClick={() => togglePanel("collage")}
        />
        <SidebarButton
          label="Elements"
          icon={<FaShapes />}
          isActive={activePanel === "elements"}
          onClick={() => togglePanel("elements")}
        />
        <SidebarButton
          label="Text"
          icon={<FaFont />}
          isActive={activePanel === "text"}
          onClick={() => togglePanel("text")}
        />
        <SidebarButton
          label="Uploads"
          icon={<FaImage />}
          onClick={() => fileInputRef.current?.click()}
        />
      </Box>
    </Paper>
  );
};

export default Sidebar;
