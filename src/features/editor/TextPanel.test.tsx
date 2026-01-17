import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TextPanel from "./TextPanel";
import { vi, describe, it, expect } from "vitest";
import { CanvasContext } from "../../context/CanvasContext";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme();

// Mock Fabric classes correctly as constructors
vi.mock("fabric", () => {
  return {
    IText: class {
      text: string;
      constructor(text: string, opts: any) {
        this.text = text;
        Object.assign(this, opts);
      }
      // Mock methods used in the component
      set(key: string, val: any) {}
    },
  };
});

const mockCanvas = {
  add: vi.fn(),
  setActiveObject: vi.fn(),
  centerObject: vi.fn(),
  requestRenderAll: vi.fn(),
};

describe("TextPanel", () => {
  const renderPanel = () => {
    return render(
      <ThemeProvider theme={theme}>
        <CanvasContext.Provider
          value={{ canvas: mockCanvas as any, setCanvas: vi.fn() }}
        >
          <TextPanel isOpen={true} onClose={vi.fn()} />
        </CanvasContext.Provider>
      </ThemeProvider>
    );
  };

  it("renders text options", () => {
    renderPanel();
    expect(screen.getByText("Add a heading")).toBeInTheDocument();
    expect(screen.getByText("Add a subheading")).toBeInTheDocument();
    expect(
      screen.getByText("Add a little bit of body text")
    ).toBeInTheDocument();
  });

  it("adds heading when clicked", () => {
    renderPanel();
    const addHeadingBtn = screen.getByText("Add a heading");
    fireEvent.click(addHeadingBtn);

    expect(mockCanvas.add).toHaveBeenCalled();
    const addedObj = mockCanvas.add.mock.calls[0][0];
    // Since we mocked the class, addedObj should be an instance of our mock class
    expect(addedObj.text).toBe("Add a heading");
    expect(addedObj.fontWeight).toBe("bold");
  });
});
