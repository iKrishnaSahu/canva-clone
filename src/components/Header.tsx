import React, { useState } from "react";
import { useCanvasContext } from "../context/CanvasContext";
import { useThemeContext } from "../context/ThemeContext";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Brightness4,
  Brightness7,
  Save as SaveIcon,
  CloudDownload,
  FileDownload,
  FileUpload,
  FolderOpen,
} from "@mui/icons-material";
import ExportModal from "./ExportModal";

const Header: React.FC = () => {
  const { canvas } = useCanvasContext();
  const { toggleTheme, mode } = useThemeContext();
  const [exportModalOpen, setExportModalOpen] = useState(false);

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
        canvas
          .loadFromJSON(JSON.parse(json))
          .then(() => {
            canvas.requestRenderAll();
          })
          .catch((err) => console.error("Error loading JSON:", err));
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
    <>
      <AppBar
        position="static"
        color="default"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Toolbar
          sx={{ justifyContent: "space-between", minHeight: "64px !important" }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{ fontWeight: "bold", display: "flex", alignItems: "center" }}
          >
            Pixelcraft
          </Typography>

          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Tooltip title="Toggle Theme">
              <IconButton onClick={toggleTheme} color="inherit">
                {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Tooltip>

            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              size="small"
            >
              Quick Save
            </Button>
            <Button
              variant="outlined"
              startIcon={<CloudDownload />}
              onClick={handleLoad}
              size="small"
            >
              Quick Load
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownload />}
              onClick={handleSaveFile}
              size="small"
            >
              Save Project
            </Button>

            <Button
              component="label"
              variant="outlined"
              startIcon={<FolderOpen />}
              size="small"
            >
              Open Project
              <input
                type="file"
                accept=".json"
                onChange={handleLoadFile}
                style={{ display: "none" }}
              />
            </Button>

            <Button
              variant="contained"
              color="primary"
              startIcon={<FileUpload />}
              onClick={() => setExportModalOpen(true)}
              size="small"
            >
              Export Image
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        canvas={canvas}
      />
    </>
  );
};

export default Header;
