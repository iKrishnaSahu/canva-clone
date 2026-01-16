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
import "./Sidebar.css";

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

  return (
    <aside className="app-sidebar">
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*"
        onChange={handleImageUpload}
      />
      <div
        className={`tool-item ${!activePanel ? "active" : ""}`}
        onClick={() => onPanelChange(null)}
      >
        <FaMousePointer size={20} />
        <span>Select</span>
      </div>
      <div
        className={`tool-item ${activePanel === "collage" ? "active" : ""}`}
        onClick={() => togglePanel("collage")}
      >
        <FaThLarge size={20} />
        <span>Layouts</span>
      </div>
      <div
        className={`tool-item ${activePanel === "elements" ? "active" : ""}`}
        onClick={() => togglePanel("elements")}
      >
        <FaShapes size={20} />
        <span>Elements</span>
      </div>
      <div
        className={`tool-item ${activePanel === "text" ? "active" : ""}`}
        onClick={() => togglePanel("text")}
      >
        <FaFont size={20} />
        <span>Text</span>
      </div>
      <div className="tool-item" onClick={() => fileInputRef.current?.click()}>
        <FaImage size={20} />
        <span>Uploads</span>
      </div>
    </aside>
  );
};

export default Sidebar;
