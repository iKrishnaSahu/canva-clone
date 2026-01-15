import React, { useEffect, useState } from "react";
import { useCanvasContext } from "../../context/CanvasContext";
import { FabricObject } from "fabric";
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

  const deleteObject = () => {
    if (selectedObjects.length > 0 && canvas) {
      canvas.remove(...selectedObjects);
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      setSelectedObjects([]);
    }
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
      <button onClick={deleteObject}>Delete</button>
      <button onClick={sendToBack}>Send to Back</button>
      <button onClick={bringToFront}>Bring to Front</button>
    </div>
  );
};

export default Toolbar;
