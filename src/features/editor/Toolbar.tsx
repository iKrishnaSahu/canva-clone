import React, { useEffect, useState } from "react";
import { useCanvasContext } from "../../context/CanvasContext";
import { FabricObject } from "fabric";
import "./Toolbar.css";

const Toolbar: React.FC = () => {
  const { canvas } = useCanvasContext();
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(
    null
  );

  useEffect(() => {
    if (!canvas) return;

    const updateSelection = () => {
      const activeObjects = canvas.getActiveObjects();
      if (activeObjects.length === 1) {
        setSelectedObject(activeObjects[0]);
      } else {
        setSelectedObject(null);
      }
    };

    canvas.on("selection:created", updateSelection);
    canvas.on("selection:updated", updateSelection);
    canvas.on("selection:cleared", () => setSelectedObject(null));

    return () => {
      canvas.off("selection:created", updateSelection);
      canvas.off("selection:updated", updateSelection);
      canvas.off("selection:cleared");
    };
  }, [canvas]);

  const changeColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedObject) {
      selectedObject.set("fill", e.target.value);
      canvas?.requestRenderAll();
    }
  };

  const deleteObject = () => {
    if (selectedObject && canvas) {
      canvas.remove(selectedObject);
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      setSelectedObject(null);
    }
  };

  const sendToBack = () => {
    if (selectedObject && canvas) {
      canvas.sendObjectToBack(selectedObject);
      canvas.requestRenderAll();
    }
  };

  const bringToFront = () => {
    if (selectedObject && canvas) {
      canvas.bringObjectToFront(selectedObject);
      canvas.requestRenderAll();
    }
  };

  if (!selectedObject) return <div className="toolbar-placeholder"></div>;

  return (
    <div className="toolbar">
      <div className="toolbar-item">
        <label>Color</label>
        <input
          type="color"
          onChange={changeColor}
          defaultValue={(selectedObject.fill as string) || "#000000"}
        />
      </div>
      <button onClick={deleteObject}>Delete</button>
      <button onClick={sendToBack}>Send to Back</button>
      <button onClick={bringToFront}>Bring to Front</button>
    </div>
  );
};

export default Toolbar;
