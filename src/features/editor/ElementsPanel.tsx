import React from "react";
import { useCanvasContext } from "../../context/CanvasContext";
import { Rect, Circle, Triangle, Line } from "fabric";
import { Box, Typography, IconButton, Paper, Button } from "@mui/material";
import { Close } from "@mui/icons-material";

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
          Elements
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </Box>

      <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          <Box sx={{ width: "calc(50% - 8px)" }}>
            <Button
              variant="outlined"
              fullWidth
              sx={{
                height: 100,
                display: "flex",
                flexDirection: "column",
                textTransform: "none",
                gap: 1,
                color: "text.primary",
                borderColor: "divider",
              }}
              onClick={() => addShape("rect")}
            >
              <Box sx={{ width: 40, height: 40, bgcolor: "text.secondary" }} />
              <Typography variant="caption">Square</Typography>
            </Button>
          </Box>
          <Box sx={{ width: "calc(50% - 8px)" }}>
            <Button
              variant="outlined"
              fullWidth
              sx={{
                height: 100,
                display: "flex",
                flexDirection: "column",
                textTransform: "none",
                gap: 1,
                color: "text.primary",
                borderColor: "divider",
              }}
              onClick={() => addShape("circle")}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  bgcolor: "text.secondary",
                }}
              />
              <Typography variant="caption">Circle</Typography>
            </Button>
          </Box>
          <Box sx={{ width: "calc(50% - 8px)" }}>
            <Button
              variant="outlined"
              fullWidth
              sx={{
                height: 100,
                display: "flex",
                flexDirection: "column",
                textTransform: "none",
                gap: 1,
                color: "text.primary",
                borderColor: "divider",
              }}
              onClick={() => addShape("triangle")}
            >
              <Box
                sx={{
                  width: 0,
                  height: 0,
                  borderLeft: "20px solid transparent",
                  borderRight: "20px solid transparent",
                  borderBottom: "40px solid",
                  borderBottomColor: "text.secondary",
                }}
              />
              <Typography variant="caption">Triangle</Typography>
            </Button>
          </Box>
          <Box sx={{ width: "calc(50% - 8px)" }}>
            <Button
              variant="outlined"
              fullWidth
              sx={{
                height: 100,
                display: "flex",
                flexDirection: "column",
                textTransform: "none",
                gap: 1,
                color: "text.primary",
                borderColor: "divider",
              }}
              onClick={() => addShape("line")}
            >
              <Box sx={{ width: 40, height: 2, bgcolor: "text.secondary" }} />
              <Typography variant="caption">Line</Typography>
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default ElementsPanel;
