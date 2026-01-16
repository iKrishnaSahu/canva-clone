import React, { useEffect, useState } from "react";
import { useCanvasContext } from "../../context/CanvasContext";
import { FabricObject, FabricImage, filters } from "fabric";
import { addImageToFrame } from "../collage/collageUtils";
import {
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaMagic,
  FaImage,
} from "react-icons/fa";
import "./Toolbar.css";

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

  const changeOpacity = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    selectedObjects.forEach((obj) => {
      obj.set("opacity", val);
    });
    canvas?.requestRenderAll();
  };

  const groupObjects = () => {
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (!activeObj || activeObj.type !== "activeSelection") return;

    // Create group
    (activeObj as any).toGroup();
    canvas.requestRenderAll();
    // After grouping, the selection becomes the new Group object
    // We need to update our local state to reflect this single selection
    setSelectedObjects([canvas.getActiveObject()!]);
  };

  const ungroupObjects = () => {
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (!activeObj || activeObj.type !== "group") return;

    // Ungroup
    (activeObj as any).toActiveSelection();
    canvas.requestRenderAll();
    // After ungrouping, the selection becomes an ActiveSelection (multiple objects)
    setSelectedObjects(canvas.getActiveObjects());
  };

  const alignObject = (align: "left" | "center" | "right") => {
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;

    const canvasWidth = canvas.width || 800;
    // const bound = activeObj.getBoundingRect();

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
    img.filters = []; // Clear existing

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

    selectedObjects.forEach((obj) => {
      // Smart Delete: If it is a collage group, or a child of one, delete appropriately.
      // Actually, the user asked for the "Existing button" to delete various blocks/collages.
      // If we select a frame, we remove it.
      // If we select the group, we remove the group.
      // Fabric's canvas.remove() handles this naturally for the passed object.
      // The only special case is identifying if we *want* to delete the whole group when a child is selected?
      // User said "delete the collage as well as the different blocks".
      // This implies they can select blocks to delete (already works if selectable),
      // or select the collage to delete.
      // So standard delete should work IF selection works.
      // But if we select a frame, `canvas.remove(frame)` leaves the group?
      // Yes, and that's "delete block".
      // If we select the group, `canvas.remove(group)` deletes the collage.

      // So I basically just need to remove the "Delete Collage" button code
      // but ensure `canvas.remove(...selectedObjects)` is called.
      // However, if the user picks a frame, the Frame is the active object (via subTargetCheck).
      // If they pick the group (by clicking edge?), the Group is active.
      // So default logic is mostly fine, EXCEPT if there's special cleanup needed.
      // For now, let's just stick to standard remove.

      canvas.remove(obj);
    });

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

  if (selectedObjects.length === 0)
    return <div className="toolbar-placeholder"></div>;

  const singleSelection =
    selectedObjects.length === 1 ? selectedObjects[0] : null;
  const commonColor = singleSelection
    ? (singleSelection.fill as string)
    : "#000000";

  return (
    <div className="toolbar">
      <div className="toolbar-item">
        <label>Color</label>
        <input type="color" onChange={changeColor} defaultValue={commonColor} />
      </div>

      <div className="toolbar-item">
        <label>Opacity</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          onChange={changeOpacity}
          defaultValue={singleSelection?.opacity || 1}
        />
      </div>

      <div className="toolbar-divider" />

      {selectedObjects.length > 1 && (
        <button onClick={groupObjects}>Group</button>
      )}

      {singleSelection &&
        (singleSelection.type === "group" ||
          (singleSelection as any).isCollageGroup === undefined) &&
        singleSelection.type === "group" && (
          <button onClick={ungroupObjects}>Ungroup</button>
        )}

      {/* Alignment Tools */}
      <div className="toolbar-item">
        <button onClick={() => alignObject("left")} title="Align Left">
          <FaAlignLeft />
        </button>
        <button onClick={() => alignObject("center")} title="Align Center">
          <FaAlignCenter />
        </button>
        <button onClick={() => alignObject("right")} title="Align Right">
          <FaAlignRight />
        </button>
      </div>

      {/* Image Filters & Fit Controls */}
      {singleSelection && singleSelection.type === "image" && (
        <div className="toolbar-item">
          <button onClick={() => applyFilter("grayscale")} title="Grayscale">
            <FaMagic /> B&W
          </button>
          <button onClick={() => applyFilter("sepia")} title="Sepia">
            <FaMagic /> Sepia
          </button>
          <button onClick={() => applyFilter("none")} title="Clear Filters">
            Normal
          </button>

          <div className="toolbar-divider" style={{ margin: "0 5px" }} />

          {/* DEBUG BUTTON */}
          <button
            onClick={() => {
              // Load a placeholder
              FabricImage.fromURL("https://placehold.co/600x400/png").then(
                (img) => {
                  const active = canvas?.getActiveObject();
                  if (active && (active as any).isFrame) {
                    addImageToFrame(canvas!, active as any, img);
                  } else if (
                    canvas?.getActiveObjects().length === 1 &&
                    (canvas?.getActiveObject() as any).isFrame
                  ) {
                    // Sometimes selection behavior varies
                    addImageToFrame(
                      canvas!,
                      canvas?.getActiveObject() as any,
                      img
                    );
                  }
                }
              );
            }}
            style={{ backgroundColor: "red", color: "white" }}
          >
            Debug Fill
          </button>

          <button
            onClick={() => {
              // Fit / Fill Toggle
              // We need the clipPath or frame dimensions to know what to fit into.
              // We saved 'itemClipPath' in collageUtils, or we check 'clipPath'.
              const img = singleSelection as FabricImage;
              const clip = img.clipPath as any; // The abs-positioned rect
              if (!clip) return;

              // Frame dims (absolute since clip is absolute)
              const frameW = clip.width * clip.scaleX;
              const frameH = clip.height * clip.scaleY;

              // Image dims
              const imgW = img.width;
              const imgH = img.height;

              // Current state check? Let's just toggle or provide 2 buttons.
              // Let's adding "Fit" button.
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
            title="Fit Image to Cell"
          >
            Fit
          </button>

          <button
            onClick={() => {
              // Fill
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
            title="Fill Cell (Crop)"
          >
            Fill
          </button>
        </div>
      )}

      {/* Collage Frame Upload */}
      {singleSelection && (singleSelection as any).isFrame && (
        <div className="toolbar-item">
          <input
            type="file"
            id="frame-upload"
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
                // Reset value
                e.target.value = "";
              };
              reader.readAsDataURL(file);
            }}
          />
          <button
            onClick={() => document.getElementById("frame-upload")?.click()}
            title="Upload Image to Cell"
          >
            <FaImage style={{ marginRight: 5 }} /> Add Image
          </button>
        </div>
      )}

      <div className="toolbar-divider" />

      <button onClick={deleteObject}>Delete</button>
      <div className="toolbar-divider" />
      <button onClick={sendToBack}>Send to Back</button>
      <button onClick={bringToFront}>Bring to Front</button>
    </div>
  );
};

export default Toolbar;
