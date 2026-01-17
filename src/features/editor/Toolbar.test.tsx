import { render, screen } from "@testing-library/react";
import Toolbar from "./Toolbar";
import { vi, describe, it, expect } from "vitest";
import { CanvasContext } from "../../context/CanvasContext";

// Mock Fabric canvas generator
const createMockCanvas = (activeObjects: any[] = []) => ({
  getActiveObjects: vi.fn(() => activeObjects),
  getActiveObject: vi.fn(() => activeObjects[0]),
  on: vi.fn(),
  off: vi.fn(),
  getObjects: vi.fn(() => []),
  requestRenderAll: vi.fn(),
});

describe("Toolbar", () => {
  it("renders Opacity slider when object is selected", () => {
    const mockCanvas = createMockCanvas([{ type: "rect", set: vi.fn() }]);
    render(
      <CanvasContext.Provider
        value={{ canvas: mockCanvas as any, setCanvas: vi.fn() }}
      >
        <Toolbar />
      </CanvasContext.Provider>,
    );
    // Use getAll because Tooltip and Slider might both match label
    const opacityElements = screen.getAllByLabelText("Opacity");
    expect(opacityElements.length).toBeGreaterThan(0);
  });

  it("renders Border and Background controls when collage group is selected", () => {
    // Mock a collage group
    const collageGroup = {
      type: "group",
      isCollageGroup: true,
      collageConfig: { spacing: 10, roundness: 5 },
      set: vi.fn(),
      on: vi.fn(),
    };

    const mockCanvas = createMockCanvas([collageGroup]);

    render(
      <CanvasContext.Provider
        value={{ canvas: mockCanvas as any, setCanvas: vi.fn() }}
      >
        <Toolbar />
      </CanvasContext.Provider>,
    );

    // Border Color input
    const borderColorInput = screen.getByLabelText("Border Color");
    expect(borderColorInput).toBeInTheDocument();

    // Background Color input
    const bgColorInput = screen.getByLabelText("Background Color");
    expect(bgColorInput).toBeInTheDocument();

    // Border Width slider
    const borderWidthInput = screen.getAllByLabelText("Border Width");
    expect(borderWidthInput.length).toBeGreaterThan(0);
  });
});
