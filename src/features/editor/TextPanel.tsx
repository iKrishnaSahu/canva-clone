import React from "react";
import { useCanvasContext } from "../../context/CanvasContext";
import { IText } from "fabric";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Paper,
  Stack,
} from "@mui/material";
import { Close } from "@mui/icons-material";

interface TextPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const TextPanel: React.FC<TextPanelProps> = ({ isOpen, onClose }) => {
  const { canvas } = useCanvasContext();

  const addText = (text: string, options: Partial<IText>) => {
    if (!canvas) return;
    const textObj = new IText(text, {
      left: 100,
      top: 100,
      fontFamily: "Inter, sans-serif",
      fill: "#333",
      ...options,
    });
    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    canvas.requestRenderAll();
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
          Text
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </Box>

      <Stack spacing={2} sx={{ p: 2 }}>
        <Button
          variant="contained"
          color="inherit" // Or primary if we want emphasis
          sx={{
            py: 2,
            textTransform: "none",
            justifyContent: "flex-start",
            bgcolor: "action.selected",
            color: "text.primary",
            "&:hover": { bgcolor: "action.hover" },
          }}
          onClick={() =>
            addText("Add a heading", { fontSize: 32, fontWeight: "bold" })
          }
        >
          <Typography variant="h5" fontWeight="bold">
            Add a heading
          </Typography>
        </Button>

        <Button
          variant="contained"
          color="inherit"
          sx={{
            py: 1.5,
            textTransform: "none",
            justifyContent: "flex-start",
            bgcolor: "action.selected",
            color: "text.primary",
            "&:hover": { bgcolor: "action.hover" },
          }}
          onClick={() =>
            addText("Add a subheading", { fontSize: 24, fontWeight: "500" })
          }
        >
          <Typography variant="h6" fontWeight="500">
            Add a subheading
          </Typography>
        </Button>

        <Button
          variant="contained"
          color="inherit"
          sx={{
            py: 1,
            textTransform: "none",
            justifyContent: "flex-start",
            bgcolor: "action.selected",
            color: "text.primary",
            "&:hover": { bgcolor: "action.hover" },
          }}
          onClick={() =>
            addText("Add a little bit of body text", { fontSize: 16 })
          }
        >
          <Typography variant="body1">Add a little bit of body text</Typography>
        </Button>
      </Stack>
    </Paper>
  );
};

export default TextPanel;
