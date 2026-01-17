import React from "react";
import { render, screen } from "@testing-library/react";
import Toolbar from "./Toolbar";
import { vi, describe, it, expect } from "vitest";
import { CanvasContext } from "../../context/CanvasContext";

// Mock Fabric canvas with active objects
const mockCanvas = {
  getActiveObjects: vi.fn(() => [{ type: "rect", set: vi.fn() }]), // Return one object
  getActiveObject: vi.fn(() => ({ type: "rect", set: vi.fn() })),
  on: vi.fn(),
  off: vi.fn(),
  getObjects: vi.fn(() => []),
  requestRenderAll: vi.fn(),
};

describe("Toolbar", () => {
  it("renders Opacity slider when object is selected", () => {
    render(
      <CanvasContext.Provider
        value={{ canvas: mockCanvas as any, setCanvas: vi.fn() }}
      >
        <Toolbar />
      </CanvasContext.Provider>
    );
    // Using getAll because there might be a Tooltip and a Slider with same label
    const opacityElements = screen.getAllByLabelText("Opacity");
    expect(opacityElements.length).toBeGreaterThan(0);
  });
});
