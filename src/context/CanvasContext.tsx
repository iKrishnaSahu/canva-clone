import React, { createContext, useContext, useState } from "react";
import { Canvas } from "fabric";

interface CanvasContextType {
  canvas: Canvas | null;
  setCanvas: (canvas: Canvas | null) => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [canvas, setCanvas] = useState<Canvas | null>(null);

  return (
    <CanvasContext.Provider value={{ canvas, setCanvas }}>
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvasContext = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error("useCanvasContext must be used within a CanvasProvider");
  }
  return context;
};
