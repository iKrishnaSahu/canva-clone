import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Box,
  Typography,
  Stack,
} from "@mui/material";
import { Canvas } from "fabric";

export type ExportFormat = "png" | "jpeg" | "webp" | "svg";
export type ResolutionPreset = "1x" | "2x" | "4x" | "custom";

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  canvas: Canvas | null;
}

interface ExportOptions {
  format: ExportFormat;
  resolution: ResolutionPreset;
  quality: number;
  filename: string;
  customWidth: number;
  customHeight: number;
}

const ExportModal: React.FC<ExportModalProps> = ({ open, onClose, canvas }) => {
  const [options, setOptions] = useState<ExportOptions>({
    format: "png",
    resolution: "2x",
    quality: 90,
    filename: "canvas-design",
    customWidth: 1920,
    customHeight: 1080,
  });

  const canvasWidth = canvas?.getWidth() || 800;
  const canvasHeight = canvas?.getHeight() || 600;

  const getMultiplier = (): number => {
    switch (options.resolution) {
      case "1x":
        return 1;
      case "2x":
        return 2;
      case "4x":
        return 4;
      case "custom":
        return options.customWidth / canvasWidth;
      default:
        return 2;
    }
  };

  const getOutputDimensions = () => {
    const multiplier = getMultiplier();
    return {
      width: Math.round(canvasWidth * multiplier),
      height: Math.round(canvasHeight * multiplier),
    };
  };

  const handleExport = () => {
    if (!canvas) return;

    const multiplier = getMultiplier();
    const extension = options.format === "jpeg" ? "jpg" : options.format;
    const filename = `${options.filename}.${extension}`;

    if (options.format === "svg") {
      // Export as SVG
      const svgData = canvas.toSVG();
      const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    } else {
      // Export as raster format
      const dataURL = canvas.toDataURL({
        format: options.format,
        quality: options.quality / 100,
        multiplier,
      });
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = filename;
      link.click();
    }

    onClose();
  };

  const showQualitySlider =
    options.format === "jpeg" || options.format === "webp";
  const outputDimensions = getOutputDimensions();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Export Image</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Filename */}
          <TextField
            label="Filename"
            value={options.filename}
            onChange={(e) =>
              setOptions({ ...options, filename: e.target.value })
            }
            fullWidth
            size="small"
            inputProps={{ "aria-label": "Filename" }}
          />

          {/* Format Selection */}
          <FormControl fullWidth size="small">
            <InputLabel id="format-label">Format</InputLabel>
            <Select
              labelId="format-label"
              value={options.format}
              label="Format"
              onChange={(e) =>
                setOptions({
                  ...options,
                  format: e.target.value as ExportFormat,
                })
              }
              inputProps={{ "aria-label": "Format" }}
            >
              <MenuItem value="png">PNG (Lossless)</MenuItem>
              <MenuItem value="jpeg">JPEG (Smaller size)</MenuItem>
              <MenuItem value="webp">WebP (Modern format)</MenuItem>
              <MenuItem value="svg">SVG (Vector)</MenuItem>
            </Select>
          </FormControl>

          {/* Resolution Presets */}
          <Box>
            <Typography variant="body2" gutterBottom>
              Resolution
            </Typography>
            <ToggleButtonGroup
              value={options.resolution}
              exclusive
              onChange={(_, value) => {
                if (value) setOptions({ ...options, resolution: value });
              }}
              aria-label="Resolution"
              size="small"
              fullWidth
            >
              <ToggleButton value="1x">1x Standard</ToggleButton>
              <ToggleButton value="2x">2x HD</ToggleButton>
              <ToggleButton value="4x">4x Ultra</ToggleButton>
              <ToggleButton value="custom">Custom</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Custom Resolution Inputs */}
          {options.resolution === "custom" && (
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Width"
                type="number"
                value={options.customWidth}
                onChange={(e) =>
                  setOptions({
                    ...options,
                    customWidth: parseInt(e.target.value) || 1,
                    customHeight: Math.round(
                      ((parseInt(e.target.value) || 1) / canvasWidth) *
                        canvasHeight,
                    ),
                  })
                }
                size="small"
                inputProps={{ min: 1, "aria-label": "Custom Width" }}
              />
              <TextField
                label="Height"
                type="number"
                value={options.customHeight}
                onChange={(e) =>
                  setOptions({
                    ...options,
                    customHeight: parseInt(e.target.value) || 1,
                    customWidth: Math.round(
                      ((parseInt(e.target.value) || 1) / canvasHeight) *
                        canvasWidth,
                    ),
                  })
                }
                size="small"
                inputProps={{ min: 1, "aria-label": "Custom Height" }}
              />
            </Box>
          )}

          {/* Quality Slider */}
          {showQualitySlider && (
            <Box>
              <Typography variant="body2" gutterBottom>
                Quality: {options.quality}%
              </Typography>
              <Slider
                value={options.quality}
                onChange={(_, value) =>
                  setOptions({ ...options, quality: value as number })
                }
                min={10}
                max={100}
                aria-label="Quality"
              />
            </Box>
          )}

          {/* Output Info */}
          <Box
            sx={{
              p: 2,
              bgcolor: "action.hover",
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Output: {outputDimensions.width} × {outputDimensions.height}{" "}
              pixels
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {options.format.toUpperCase()} format
              {showQualitySlider && ` • ${options.quality}% quality`}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleExport} variant="contained" color="primary">
          Export
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportModal;
