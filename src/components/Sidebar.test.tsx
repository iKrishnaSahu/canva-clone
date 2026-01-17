import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Sidebar from "./Sidebar";
import { vi, describe, it, expect } from "vitest";
import { CanvasContext } from "../context/CanvasContext";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme();

describe("Sidebar", () => {
  const mockOnPanelChange = vi.fn();

  // Start with null so clicking a tab opens it
  const activePanel = null;

  const renderSidebar = (props: any = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <CanvasContext.Provider value={{ canvas: null, setCanvas: vi.fn() }}>
          <Sidebar
            activePanel={
              props.hasOwnProperty("activePanel")
                ? props.activePanel
                : activePanel
            }
            onPanelChange={props.onPanelChange || mockOnPanelChange}
          />
        </CanvasContext.Provider>
      </ThemeProvider>
    );
  };

  it("renders all main tabs", () => {
    renderSidebar();

    expect(screen.getByRole("button", { name: /select/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /text/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /elements/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /uploads/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /layouts/i })
    ).toBeInTheDocument();
  });

  it("calls onPanelChange when a tab is clicked", () => {
    renderSidebar();

    const textBtn = screen.getByRole("button", { name: /text/i });
    fireEvent.click(textBtn);

    expect(mockOnPanelChange).toHaveBeenCalledWith("text");
  });
});
