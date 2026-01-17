import React from 'react';
import { render, unmountComponentAtNode } from '@testing-library/react';
import { useCanvas } from './useCanvas';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Canvas } from 'fabric';

// Mock Fabric
vi.mock('fabric', () => {
  const CanvasMock = vi.fn(function (this: any) {
    this.dispose = vi.fn();
    this.width = 800;
    this.height = 600;
  });
  return { Canvas: CanvasMock };
});

const TestComponent = () => {
  const { canvasRef } = useCanvas();
  return <canvas ref={ canvasRef } />;
};

describe('useCanvas', () => {
  beforeEach(() => {
    (window as any).canvas = undefined;
    vi.clearAllMocks();
  });

  it('should initialize fabric canvas on mount', () => {
    render(<TestComponent />);

    expect(Canvas).toHaveBeenCalledTimes(1);
    expect((window as any).canvas).toBeDefined();
  });

  it('should dispose fabric canvas on unmount', () => {
    const { unmount } = render(<TestComponent />);

    const canvasInstance = (window as any).canvas;
    expect(canvasInstance).toBeDefined();

    unmount();

    expect(canvasInstance.dispose).toHaveBeenCalled();
  });
});
