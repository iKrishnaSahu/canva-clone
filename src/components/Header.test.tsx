import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Header from "./Header";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { CanvasContext } from "../context/CanvasContext";
import { ThemeContext } from "../context/ThemeContext";

// Mocks
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

const mockCanvas = {
  toDataURL: vi.fn(),
  toJSON: vi.fn(() => ({ version: "5.0.0", objects: [] })),
  loadFromJSON: vi.fn().mockResolvedValue(true),
  requestRenderAll: vi.fn(),
};

const mockToggleTheme = vi.fn();

const renderHeader = (canvas: any = mockCanvas) => {
  return render(
    <ThemeContext.Provider
      value={{ mode: "light", toggleTheme: mockToggleTheme }}
    >
      <CanvasContext.Provider value={{ canvas, setCanvas: vi.fn() }}>
        <Header />
      </CanvasContext.Provider>
    </ThemeContext.Provider>
  );
};

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Storage mock
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
      },
      writable: true,
    });
    window.alert = vi.fn();
    window.URL.createObjectURL = vi.fn();
  });

  it("renders the title", () => {
    renderHeader();
    expect(screen.getByText("CanvaClone")).toBeInTheDocument();
  });

  it("calls toggleTheme when theme button is clicked", () => {
    renderHeader();
    const themeBtn = screen.getByLabelText("Toggle Theme"); // Tooltip title becomes label
    fireEvent.click(themeBtn);
    expect(mockToggleTheme).toHaveBeenCalled();
  });

  it("handles Quick Save correctly", () => {
    renderHeader();
    const saveBtn = screen.getByText("Quick Save");
    fireEvent.click(saveBtn);
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "canvas-design",
      expect.any(String)
    );
    expect(window.alert).toHaveBeenCalled();
  });
});
