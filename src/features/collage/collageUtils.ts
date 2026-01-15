import { Canvas, Rect, Group, FabricObject, FabricImage } from 'fabric';
import type { GridLayout } from './gridTemplates';
import { v4 as uuidv4 } from 'uuid';

export const addGridToCanvas = (canvas: Canvas, layout: GridLayout) => {
  const groupObjects: FabricObject[] = [];

  // Dynamic sizing
  const margin = 50;
  const canvasWidth = canvas.width || 800;
  const canvasHeight = canvas.height || 600;

  // Available space
  const availableWidth = canvasWidth - (margin * 2);
  const availableHeight = canvasHeight - (margin * 2);

  const BASE_WIDTH = 400; // From gridTemplates.ts
  const BASE_HEIGHT = 400;

  // Calculate scale to fit
  // Use 'cover' or 'contain' logic? 'Contain' is safer so it fits.
  // We want to scale the 400x400 grid to fit into availableWidth x availableHeight
  const scaleX = availableWidth / BASE_WIDTH;
  const scaleY = availableHeight / BASE_HEIGHT;

  // Maintain aspect ratio if desired, but grids might be flexible. 
  // Let's use the smaller scale to fit entirely.
  const scale = Math.min(scaleX, scaleY);

  // Center logic
  const contentWidth = BASE_WIDTH * scale;
  const contentHeight = BASE_HEIGHT * scale;

  const offsetX = (canvasWidth - contentWidth) / 2;
  const offsetY = (canvasHeight - contentHeight) / 2;

  layout.frames.forEach((frame) => {
    const rect = new Rect({
      left: (frame.left * scale) + offsetX, // Scale coordinate
      top: (frame.top * scale) + offsetY,
      width: frame.width * scale, // Scale dimension
      height: frame.height * scale,
      fill: frame.fill,
      stroke: '#fff',
      strokeWidth: 2,
      selectable: true,
      hasControls: true,
      lockScalingX: false,
      lockScalingY: false,
      strokeUniform: true // Keep stroke width constant
    });

    // Use custom property
    (rect as any).id = uuidv4();
    (rect as any).isFrame = true;

    groupObjects.push(rect);
  });

  const group = new Group(groupObjects, {
    left: offsetX,
    top: offsetY,
    subTargetCheck: true, // Allows selecting inner objects
    interactive: true,
  });

  // Tag the group
  (group as any).isCollageGroup = true;

  canvas.add(group);
  canvas.setActiveObject(group);
  canvas.requestRenderAll();
};

export const addImageToFrame = (canvas: Canvas, frame: Rect, img: FabricImage) => {
  // 1. Calculate image scale to cover the frame
  const frameWidth = frame.width * frame.scaleX;
  const frameHeight = frame.height * frame.scaleY;

  const scale = Math.max(frameWidth / img.width, frameHeight / img.height);

  img.scale(scale);

  // 2. Center image
  const centerPoint = frame.getCenterPoint();

  img.set({
    left: centerPoint.x - (img.width * scale) / 2,
    top: centerPoint.y - (img.height * scale) / 2,
    clipPath: frame // Use the frame as clipPath
  });

  // Clone frame for clipPath purposes if needed (Fabric clipPath is absolute)
  frame.clone().then((clonedFrame: any) => {
    clonedFrame.absolutePositioned = true;
    clonedFrame.left = frame.getCoords()[0].x;

    // Position/Scale logic for clipPath (simplified for MVP)
    // We reuse the basic frame rect properties but ensure it's absolute

    clonedFrame.set({
      left: centerPoint.x - frameWidth / 2,
      top: centerPoint.y - frameHeight / 2,
      width: frameWidth / frame.scaleX,
      height: frameHeight / frame.scaleY,
      scaleX: frame.scaleX,
      scaleY: frame.scaleY,
      absolutePositioned: true
    });

    img.set({
      itemClipPath: clonedFrame
    });

    img.clipPath = clonedFrame;
    canvas.add(img);
    canvas.setActiveObject(img);
    canvas.requestRenderAll();
  });
};
