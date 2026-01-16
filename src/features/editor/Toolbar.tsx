import React, { useEffect, useState } from "react";
import { useCanvasContext } from "../../context/CanvasContext";
import { FabricObject, FabricImage, filters } from "fabric";
import {
  addImageToFrame,
  updateCollageSettings,
} from "../collage/collageUtils";
import {
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  AutoFixHigh,
  Image as ImageIcon,
  Delete,
  FlipToFront,
  FlipToBack,
  Crop,
  AspectRatio,
  GroupWork,
  AccountTree,
  GridOn,
  RoundedCorner,
} from "@mui/icons-material";

import {
  Box,
  Paper,
  Slider,
  Tooltip,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Typography,
  Button,
} from "@mui/material";

const Toolbar: React.FC = () => {
  const { canvas } = useCanvasContext();
  const [selectedObjects, setSelectedObjects] = useState<FabricObject[]>([]);

  useEffect(() => {
    if (!canvas) return;

    const updateSelection = () => {
      const active = canvas.getActiveObjects();
      setSelectedObjects(active);
    };

    canvas.on("selection:created", updateSelection);
    canvas.on("selection:updated", updateSelection);
    canvas.on("selection:cleared", () => setSelectedObjects([]));

    return () => {
      canvas.off("selection:created", updateSelection);
      canvas.off("selection:updated", updateSelection);
      canvas.off("selection:cleared");
    };
  }, [canvas]);

  const changeColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    selectedObjects.forEach((obj) => {
      obj.set("fill", e.target.value);
    });
    canvas?.requestRenderAll();
  };

  const changeOpacity = (_: Event, newValue: number | number[]) => {
    const val = newValue as number;
    selectedObjects.forEach((obj) => {
      obj.set("opacity", val);
    });
    canvas?.requestRenderAll();
  };

  const groupObjects = () => {
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (!activeObj || activeObj.type !== "activeSelection") return;

    (activeObj as any).toGroup();
    canvas.requestRenderAll();
    setSelectedObjects([canvas.getActiveObject()!]);
  };

  const ungroupObjects = () => {
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (!activeObj || activeObj.type !== "group") return;

    (activeObj as any).toActiveSelection();
    canvas.requestRenderAll();
    setSelectedObjects(canvas.getActiveObjects());
  };

  const alignObject = (align: "left" | "center" | "right") => {
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;

    const canvasWidth = canvas.width || 800;

    if (align === "left") {
      activeObj.set({ left: 0 });
      if (activeObj.originX === "center") {
        activeObj.set({ left: activeObj.getScaledWidth() / 2 });
      } else {
        activeObj.set({ left: 0 });
      }
    } else if (align === "center") {
      canvas.centerObjectH(activeObj);
    } else if (align === "right") {
      if (activeObj.originX === "center") {
        activeObj.set({ left: canvasWidth - activeObj.getScaledWidth() / 2 });
      } else {
        activeObj.set({ left: canvasWidth - activeObj.getScaledWidth() });
      }
    }
    activeObj.setCoords();
    canvas.requestRenderAll();
  };

  const applyFilter = (type: "grayscale" | "sepia" | "none") => {
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (!activeObj || activeObj.type !== "image") return;

    const img = activeObj as FabricImage;
    img.filters = [];

    if (type === "grayscale") {
      img.filters.push(new filters.Grayscale());
    } else if (type === "sepia") {
      img.filters.push(new filters.Sepia());
    }

    img.applyFilters();
    canvas.requestRenderAll();
  };

  const deleteObject = () => {
    if (!canvas) return;
    selectedObjects.forEach((obj) => canvas.remove(obj));
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    setSelectedObjects([]);
  };

  const sendToBack = () => {
    if (canvas) {
      selectedObjects.forEach((obj) => canvas.sendObjectToBack(obj));
      canvas.requestRenderAll();
    }
  };

  const bringToFront = () => {
    if (canvas) {
      selectedObjects.forEach((obj) => canvas.bringObjectToFront(obj));
      canvas.requestRenderAll();
    }
  };

  if (selectedObjects.length === 0) return <Box sx={{ height: 60 }} />;

  const singleSelection =
    selectedObjects.length === 1 ? selectedObjects[0] : null;

  // Collage Settings
  const isCollageGroup =
    singleSelection && (singleSelection as any).isCollageGroup;
  const isCollageFrame = singleSelection && (singleSelection as any).isFrame;
  const showCollageControls = isCollageGroup || isCollageFrame;

  const collageConfig = isCollageGroup
    ? (singleSelection as any).collageConfig || { spacing: 0, roundness: 0 }
    : { spacing: 0, roundness: (singleSelection as any).rx || 0 };
  // Note: For frames, we read rx. Spacing (padding) is stateless/delta unless stored.
  // We default spacing to 0 for single frame adjustments as "padding" usually starts from current.

  const handleSpacingChange = (_: Event, newValue: number | number[]) => {
    if (!canvas) return;
    const val = newValue as number;
    updateCollageSettings(
      canvas,
      { spacing: val, roundness: collageConfig.roundness },
      singleSelection || undefined
    );
    // Force re-render to update UI slider state if needed (though we read from object on render)
    // State lifting might be better but reading from object works if we trigger re-render
    canvas.requestRenderAll();
  };

  const handleRoundnessChange = (_: Event, newValue: number | number[]) => {
    if (!canvas) return;
    const val = newValue as number;
    updateCollageSettings(
      canvas,
      { spacing: collageConfig.spacing, roundness: val },
      singleSelection || undefined
    );
    canvas.requestRenderAll();
  };

  // Safe checks for properties
  const commonColor = singleSelection
    ? (singleSelection.fill as string)
    : "#000000";
  const commonOpacity = singleSelection ? singleSelection.opacity ?? 1 : 1;
  const isBold =
    singleSelection && (singleSelection as any).fontWeight === "bold";
  const isItalic =
    singleSelection && (singleSelection as any).fontStyle === "italic";
  const isUnderline = singleSelection && (singleSelection as any).underline;

  return (
    <Paper
      elevation={2}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 1,
        mb: 1,
        borderRadius: 2,
        mx: 2,
        mt: 1,
        flexWrap: "wrap",
      }}
    >
      {/* Color Picker */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <input
          type="color"
          value={typeof commonColor === "string" ? commonColor : "#000000"} // Ensure value is string
          onChange={changeColor}
          style={{
            width: 32,
            height: 32,
            padding: 0,
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
          title="Color"
        />
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* Opacity Slider */}
      <Box sx={{ width: 100, display: "flex", alignItems: "center", gap: 1 }}>
        <Tooltip title="Opacity">
          <Typography variant="caption">Op</Typography>
        </Tooltip>
        <Slider
          size="small"
          value={commonOpacity}
          min={0}
          max={1}
          step={0.1}
          onChange={changeOpacity}
          aria-label="Opacity"
        />
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* Grouping */}
      {selectedObjects.length > 1 && (
        <Tooltip title="Group">
          <IconButton onClick={groupObjects}>
            <GroupWork />
          </IconButton>
        </Tooltip>
      )}

      {/* Collage Controls */}
      {showCollageControls && (
        <>
          <Box
            sx={{ width: 120, display: "flex", alignItems: "center", gap: 1 }}
          >
            <Tooltip title={isCollageFrame ? "Padding" : "Spacing"}>
              <GridOn fontSize="small" color="action" />
            </Tooltip>
            <Slider
              size="small"
              value={collageConfig.spacing || 0} // Default 0 for frame padding
              min={0}
              max={50}
              onChange={handleSpacingChange}
              // For Frames, spacing acts as "shrink", so subsequent drags might compound if we don't track base?
              // `updateCollageSettings` uses `originalLayout` and absolute `spacing` value to recalculate.
              // So the slider value MUST be the absolute "spacing" intended.
              // For a Frame, we don't store "spacing" on it yet in `collageUtils`.
              // If we don't store it, the slider will snap to 0.
              // We should ideally store "padding" on the frame.
            />
          </Box>
          <Box
            sx={{ width: 120, display: "flex", alignItems: "center", gap: 1 }}
          >
            <Tooltip title="Roundness">
              <RoundedCorner fontSize="small" color="action" />
            </Tooltip>
            <Slider
              size="small"
              value={collageConfig.roundness || 0}
              min={0}
              max={50}
              onChange={handleRoundnessChange}
            />
          </Box>
          <Divider orientation="vertical" flexItem />
        </>
      )}
      {singleSelection && singleSelection.type === "group" && (
        <Tooltip title="Ungroup">
          <IconButton onClick={ungroupObjects}>
            <AccountTree />
          </IconButton>
        </Tooltip>
      )}

      {/* Text Tools */}
      {singleSelection && singleSelection.type === "i-text" && (
        <>
          <Divider orientation="vertical" flexItem />
          <ToggleButtonGroup size="small">
            <ToggleButton
              value="bold"
              selected={!!isBold}
              onClick={() => {
                const obj = singleSelection as any;
                obj.set("fontWeight", isBold ? "normal" : "bold");
                canvas?.requestRenderAll();
                // Force re-render to update UI state
                setSelectedObjects([...selectedObjects]);
              }}
            >
              <FormatBold />
            </ToggleButton>
            <ToggleButton
              value="italic"
              selected={!!isItalic}
              onClick={() => {
                const obj = singleSelection as any;
                obj.set("fontStyle", isItalic ? "normal" : "italic");
                canvas?.requestRenderAll();
                setSelectedObjects([...selectedObjects]);
              }}
            >
              <FormatItalic />
            </ToggleButton>
            <ToggleButton
              value="underline"
              selected={!!isUnderline}
              onClick={() => {
                const obj = singleSelection as any;
                obj.set("underline", !obj.underline);
                canvas?.requestRenderAll();
                setSelectedObjects([...selectedObjects]);
              }}
            >
              <FormatUnderlined />
            </ToggleButton>
          </ToggleButtonGroup>
        </>
      )}

      <Divider orientation="vertical" flexItem />

      {/* Alignment */}
      <Box sx={{ display: "flex" }}>
        <Tooltip title="Align Left">
          <IconButton onClick={() => alignObject("left")}>
            <FormatAlignLeft />
          </IconButton>
        </Tooltip>
        <Tooltip title="Align Center">
          <IconButton onClick={() => alignObject("center")}>
            <FormatAlignCenter />
          </IconButton>
        </Tooltip>
        <Tooltip title="Align Right">
          <IconButton onClick={() => alignObject("right")}>
            <FormatAlignRight />
          </IconButton>
        </Tooltip>
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* Image Filters */}
      {singleSelection && singleSelection.type === "image" && (
        <>
          <Tooltip title="Grayscale">
            <IconButton onClick={() => applyFilter("grayscale")}>
              <AutoFixHigh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sepia">
            <IconButton onClick={() => applyFilter("sepia")}>
              <AutoFixHigh color="secondary" />
            </IconButton>
          </Tooltip>
          <Button size="small" onClick={() => applyFilter("none")}>
            Normal
          </Button>

          <Divider orientation="vertical" flexItem />

          {/* Fit/Fill */}
          <Tooltip title="Fit">
            <IconButton
              onClick={() => {
                // Fit logic ...
                const img = singleSelection as FabricImage;
                const clip = img.clipPath as any; // The abs-positioned rect
                if (!clip) return;
                const frameW = clip.width * clip.scaleX;
                const frameH = clip.height * clip.scaleY;
                const imgW = img.width;
                const imgH = img.height;
                const scale = Math.min(frameW / imgW, frameH / imgH);
                img.set({
                  scaleX: scale,
                  scaleY: scale,
                  left: clip.left + (frameW - imgW * scale) / 2,
                  top: clip.top + (frameH - imgH * scale) / 2,
                });
                img.setCoords();
                canvas?.requestRenderAll();
              }}
            >
              <AspectRatio />
            </IconButton>
          </Tooltip>
          <Tooltip title="Fill">
            <IconButton
              onClick={() => {
                // Fill logic ...
                const img = singleSelection as FabricImage;
                const clip = img.clipPath as any;
                if (!clip) return;
                const frameW = clip.width * clip.scaleX;
                const frameH = clip.height * clip.scaleY;
                const imgW = img.width;
                const imgH = img.height;
                const scale = Math.max(frameW / imgW, frameH / imgH);
                img.set({
                  scaleX: scale,
                  scaleY: scale,
                  left: clip.left + (frameW - imgW * scale) / 2,
                  top: clip.top + (frameH - imgH * scale) / 2,
                });
                img.setCoords();
                canvas?.requestRenderAll();
              }}
            >
              <Crop />
            </IconButton>
          </Tooltip>

          {/* Replace Image */}
          {(singleSelection as any).isFrame && (
            <>
              <input
                type="file"
                id="frame-upload-toolbar"
                style={{ display: "none" }}
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file || !canvas) return;
                  const reader = new FileReader();
                  reader.onload = (f) => {
                    const data = f.target?.result as string;
                    FabricImage.fromURL(data).then((img) => {
                      addImageToFrame(canvas, singleSelection as any, img);
                    });
                    e.target.value = "";
                  };
                  reader.readAsDataURL(file);
                }}
              />
              <Tooltip title="Replace Image">
                <IconButton
                  onClick={() =>
                    document.getElementById("frame-upload-toolbar")?.click()
                  }
                >
                  <ImageIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </>
      )}

      <Divider orientation="vertical" flexItem />

      <Tooltip title="Send to Back">
        <IconButton onClick={sendToBack}>
          <FlipToBack />
        </IconButton>
      </Tooltip>
      <Tooltip title="Bring to Front">
        <IconButton onClick={bringToFront}>
          <FlipToFront />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton onClick={deleteObject} color="error">
          <Delete />
        </IconButton>
      </Tooltip>
    </Paper>
  );
};

export default Toolbar;
