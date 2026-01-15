import React, { useRef } from "react";
import {
  FaFont,
  FaShapes,
  FaImage,
  FaMousePointer,
  FaThLarge,
} from "react-icons/fa";
import { useCanvasContext } from "../context/CanvasContext";
import { Rect, Circle, IText, FabricImage } from "fabric";
import { addImageToFrame } from "../features/collage/collageUtils";
import "./Sidebar.css";

interface SidebarProps {
  onCollageClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onCollageClick }) => {
  const { canvas } = useCanvasContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addRectangle = () => {
    if (!canvas) return;
    const rect = new Rect({
      left: 100,
      top: 100,
      fill: "#ff5722",
      width: 100,
      height: 100,
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
  };

  const addCircle = () => {
    if (!canvas) return;
    const circle = new Circle({
      left: 200,
      top: 100,
      fill: "#00bcd4",
      radius: 50,
    });
    canvas.add(circle);
    canvas.setActiveObject(circle);
  };

  const addText = () => {
    if (!canvas) return;
    const text = new IText("Add Heading", {
      left: 300,
      top: 200,
      fontFamily: "Arial",
      fill: "#333",
    });
    canvas.add(text);
    canvas.setActiveObject(text);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target?.result as string;
      FabricImage.fromURL(data).then((img) => {
        // Check if a frame is selected
        const activeObject = canvas.getActiveObject();
        // We marked frames with isFrame = true
        if (activeObject && (activeObject as any).isFrame) {
          addImageToFrame(canvas, activeObject as Rect, img);
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
    // Reset input
    e.target.value = "";
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
      <div className="tool-item active">
        <FaMousePointer size={20} />
        <span>Select</span>
      </div>
      <div className="tool-item" onClick={onCollageClick}>
        <FaThLarge size={20} />
        <span>Collage</span>
      </div>
      <div className="tool-item" onClick={addRectangle}>
        <FaShapes size={20} />
        <span>Rect</span>
      </div>
      <div className="tool-item" onClick={addCircle}>
        <FaShapes size={20} />
        <span>Circle</span>
      </div>
      <div className="tool-item" onClick={addText}>
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
