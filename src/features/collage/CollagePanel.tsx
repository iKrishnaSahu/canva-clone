import React, { useEffect } from "react";
import { useCanvasContext } from "../../context/CanvasContext";
import { GRID_TEMPLATES } from "./gridTemplates";
import type { GridLayout } from "./gridTemplates";
import { addGridToCanvas } from "./collageUtils";
import {
  Box,
  Typography,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
} from "@mui/material";
import { Close } from "@mui/icons-material";

interface CollagePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const CollagePanel: React.FC<CollagePanelProps> = ({ isOpen, onClose }) => {
  const { canvas } = useCanvasContext();
  useEffect(() => {
    // Removed selection listening logic as settings are now in Toolbar
  }, [canvas]);

  const handleTemplateClick = (template: GridLayout) => {
    if (canvas) {
      addGridToCanvas(canvas, template);
    }
  };

  const resizeCanvas = (width: number, height: number) => {
    if (!canvas) return;
    canvas.setDimensions({ width, height });
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
    <Paper
      elevation={4}
      sx={{
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: 320,
        zIndex: 110,
        display: "flex",
        flexDirection: "column",
        borderRight: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Layouts
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </Box>

      <Box sx={{ p: 2, overflowY: "auto" }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
          Cell Settings (moved to toolbar)
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Use the top toolbar to adjust Spacing and Roundness when a collage
            is selected.
          </Typography>
        </Paper>

        <FormControl fullWidth size="small" sx={{ mb: 3 }}>
          <InputLabel>Canvas Format</InputLabel>
          <Select
            defaultValue="Portrait (4:5)"
            label="Canvas Format"
            onChange={(e) => {
              const fmt = formats.find((f) => f.label === e.target.value);
              if (fmt) resizeCanvas(fmt.width, fmt.height);
            }}
          >
            {formats.map((f) => (
              <MenuItem key={f.label} value={f.label}>
                {f.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="subtitle2" sx={{ mb: 1, color: "text.secondary" }}>
          Templates
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          {GRID_TEMPLATES.map((tpl, idx) => (
            <Box sx={{ width: "calc(50% - 8px)" }} key={idx}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1,
                  cursor: "pointer",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: "action.hover",
                  },
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                }}
                onClick={() => handleTemplateClick(tpl)}
              >
                <div
                  style={{
                    position: "relative",
                    width: "60px",
                    height: "60px",
                  }}
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
                        boxSizing: "border-box",
                      }}
                    ></div>
                  ))}
                </div>
                <Typography variant="caption">{tpl.name}</Typography>
              </Paper>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default CollagePanel;
