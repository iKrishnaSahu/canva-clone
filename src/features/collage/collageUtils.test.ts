import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addGridToCanvas, updateCollageSettings } from './collageUtils';
import { Canvas, Rect, Group } from 'fabric';

vi.mock('fabric', () => {
  const Canvas = vi.fn(function (this: any) {
    this.add = vi.fn();
    this.centerObject = vi.fn();
    this.setActiveObject = vi.fn();
    this.requestRenderAll = vi.fn();
    this.width = 800;
    this.height = 600;
    this.getObjects = vi.fn(() => []);
    this.getActiveObject = vi.fn();
  });

  const Rect = vi.fn(function (this: any, opts: any) {
    Object.assign(this, opts);
    this.set = vi.fn((newOpts) => Object.assign(this, newOpts));
    this.setCoords = vi.fn();
    this.getBoundingRect = vi.fn(() => ({ left: 0, top: 0, width: 100, height: 100 }));
    this.strokeWidth = 0;
    this.clone = vi.fn().mockResolvedValue({ set: vi.fn(), setCoords: vi.fn() });
    this.isFrame = opts?.isFrame;
  });

  const Group = vi.fn(function (this: any, objects: any[], opts: any) {
    Object.assign(this, opts);
    this._objects = objects || [];
    this.getObjects = () => this._objects;
    this.addWithUpdate = vi.fn();
    this.set = vi.fn((newOpts) => Object.assign(this, newOpts));
    this.setCoords = vi.fn();
    this.toObject = vi.fn();
  });

  return {
    Canvas,
    Rect,
    Group,
    FabricImage: {
      fromURL: vi.fn(),
    }
  };
});

describe('collageUtils', () => {
  let canvas: any;

  beforeEach(() => {
    vi.clearAllMocks();
    canvas = new Canvas('c' as any);
  });

  describe('addGridToCanvas', () => {
    it('should add a group to the canvas with correct metadata', () => {
      const layout = {
        name: 'Test',
        frames: [
          { left: 0, top: 0, width: 200, height: 400, fill: '#eee' },
          { left: 200, top: 0, width: 200, height: 400, fill: '#ddd' }
        ]
      };

      addGridToCanvas(canvas, layout);

      expect(canvas.add).toHaveBeenCalled();
      const addedGroup = (canvas.add as any).mock.calls[0][0];

      expect(addedGroup).toBeDefined();
      expect(addedGroup.isCollageGroup).toBe(true);
      expect(addedGroup.getObjects()).toHaveLength(2);
      expect(canvas.centerObject).toHaveBeenCalledWith(addedGroup);
    });
  });

  describe('updateCollageSettings', () => {
    it('should update spacing and roundness of frames in the group', () => {
      const frames = [
        new Rect({ left: 0, top: 0, width: 200, height: 400, fill: '#eee' } as any),
        new Rect({ left: 200, top: 0, width: 200, height: 400, fill: '#ddd' } as any)
      ];
      frames.forEach(f => (f as any).isFrame = true);

      const group = new Group(frames);
      (group as any).isCollageGroup = true;
      (group as any).originalLayout = {
        frames: [
          { left: 0, top: 0, width: 200, height: 400, fill: '#eee' },
          { left: 200, top: 0, width: 200, height: 400, fill: '#ddd' }
        ]
      };

      canvas.getObjects = vi.fn(() => [group]);
      canvas.getActiveObject = vi.fn(() => group);

      updateCollageSettings(canvas, { spacing: 10, roundness: 5 });

      const frame0 = frames[0];
      expect(frame0.set).toHaveBeenCalled();

      const setCall = (frame0.set as any).mock.calls[0][0];
      expect(setCall.rx).toBe(5);
      expect(setCall.ry).toBe(5);
      expect(setCall.width).toEqual(expect.any(Number));
      expect(setCall.height).toEqual(expect.any(Number));
    });
    it('should update border settings (width, color, style)', () => {
      const frames = [
        new Rect({ left: 0, top: 0, width: 200, height: 400 } as any)
      ];
      frames.forEach(f => (f as any).isFrame = true);
      const group = new Group(frames);
      (group as any).isCollageGroup = true;
      (group as any).originalLayout = {
        frames: [{ left: 0, top: 0, width: 200, height: 400 }]
      };

      canvas.getActiveObject = vi.fn(() => group);

      // Test Border Color & Width
      updateCollageSettings(canvas, { spacing: 0, roundness: 0, borderColor: 'red', borderWidth: 5, borderStyle: 'solid' });

      const frame = frames[0];
      const setCall1 = (frame.set as any).mock.calls[0][0]; // First call
      expect(setCall1.stroke).toBe('red');
      expect(setCall1.strokeWidth).toBe(5);
      expect(setCall1.strokeDashArray).toBeNull(); // Solid = null or empty

      // Test Border Style (Dashed)
      (frame.set as any).mockClear();
      updateCollageSettings(canvas, { spacing: 0, roundness: 0, borderStyle: 'dashed' });
      const setCall2 = (frame.set as any).mock.calls[0][0];
      expect(setCall2.strokeDashArray).toEqual([10, 5]);
    });
  });
});
