import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ElementsPanel from "./ElementsPanel";
import { vi, describe, it, expect } from "vitest";
import { CanvasContext } from "../../context/CanvasContext";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme();

const mockCanvas = {
  add: vi.fn(),
  setActiveObject: vi.fn(),
  centerObject: vi.fn(),
  requestRenderAll: vi.fn(),
};

describe("ElementsPanel", () => {
  const renderPanel = () => {
    return render(
      <ThemeProvider theme={theme}>
        <CanvasContext.Provider
          value={{ canvas: mockCanvas as any, setCanvas: vi.fn() }}
        >
          <ElementsPanel isOpen={true} onClose={vi.fn()} />
        </CanvasContext.Provider>
      </ThemeProvider>
    );
  };

  it("renders shape options", () => {
    renderPanel();
    expect(screen.getByText("Square")).toBeInTheDocument();
    expect(screen.getByText("Circle")).toBeInTheDocument();
  });

  it("adds rectangle when clicked", () => {
    renderPanel();
    const rectBtn = screen.getByText("Square");
    fireEvent.click(rectBtn);
    expect(mockCanvas.add).toHaveBeenCalled();
  });
});
