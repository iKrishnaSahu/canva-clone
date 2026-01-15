import React from "react";
import { useCanvasContext } from "../../context/CanvasContext";
import { useObjectPosition } from "../../hooks/useObjectPosition"; // We'll create this or inline logic
import { FaTrash } from "react-icons/fa";
import "./FloatingActionBar.css";

const FloatingActionBar: React.FC = () => {
  const { canvas } = useCanvasContext();
  const [selectedObject, setSelectedObject] = React.useState<any>(null);
  const position = useObjectPosition(canvas, selectedObject);

  React.useEffect(() => {
    if (!canvas) return;
    const update = () => {
      const active = canvas.getActiveObjects();
      if (active.length > 0) {
        // If multiple, maybe we position around the group?
        // For now, simplify to first or group selection
        const target =
          active.length === 1 ? active[0] : canvas.getActiveObject();
        setSelectedObject(target || null);
      } else {
        setSelectedObject(null);
      }
    };
    canvas.on("selection:created", update);
    canvas.on("selection:updated", update);
    canvas.on("selection:cleared", () => setSelectedObject(null));
    return () => {
      canvas.off("selection:created", update);
      canvas.off("selection:updated", update);
      canvas.off("selection:cleared");
    };
  }, [canvas]);

  if (!selectedObject || !position) return null;

  const handleDelete = () => {
    if (!canvas) return;

    // Check if we selected a collage part
    const collageGroup = (selectedObject as any).isCollageGroup
      ? selectedObject
      : selectedObject.group && (selectedObject.group as any).isCollageGroup
      ? selectedObject.group
      : null;

    if (collageGroup) {
      // Option: Delete the entire collage group if any part is selected?
      // OR: Delete the specific part?
      // User asked: "single delete button for collage AND other objects".
      // Interpretation: One button that "does the right thing".
      // If I selected the whole group, delete the group.
      // If I selected a frame, arguably deleting the FRAME is "deleting the object".
      // But if the user says "it is not deleting the collage", maybe they expect the whole grid to go.
      // Let's implement this:
      // If it's a collage, delete the whole collage group.
      // This makes "Delete" on a collage cell remove the collage.
      // If they want to remove just the image/cell, maybe we need a different action?
      // But usually "Delete" removes the entity.

      canvas.remove(collageGroup);
    } else {
      canvas.remove(selectedObject);
    }

    canvas.discardActiveObject();
    canvas.requestRenderAll();
    setSelectedObject(null);
  };

  return (
    <div
      className="floating-action-bar"
      style={{
        top: position.top,
        left: position.left,
        transform: "translate(-50%, 0)",
      }}
    >
      <button
        onClick={handleDelete}
        className="fab-btn delete-btn"
        title="Delete"
      >
        <FaTrash />
      </button>
    </div>
  );
};

export default FloatingActionBar;
