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

  // Calculate scaling
  // We want the grid to fill the available space while maintaining its relative proportions locally
  // But wait, if the canvas format changes (e.g. 9:16), the "Grid" should probably adapt to that aspect ratio?
  // User asked "creating collage for different aspect ratio considering different formats".
  // This implies the grid layout itself should STRETCH to fit the canvas format, usually.
  // Or distinct templates for distinct ratios.
  // Assuming "Responsive Grid" approach: we stretch the 400x400 base layout to fill available area.

  const scaleX = availableWidth / BASE_WIDTH;
  const scaleY = availableHeight / BASE_HEIGHT;

  // If we want to stretch to fill (distortion of squares -> rectangles):
  // const finalScaleX = scaleX;
  // const finalScaleY = scaleY;

  // If we want to keep squares square, we use min scale.
  // Most collage apps STRETCH the layout to the canvas ratio.
  const stretch = true;

  const offsetX = margin;
  const offsetY = margin;

  layout.frames.forEach((frame) => {
    // If stretching, we scale X and Y independently
    const effectiveScaleX = stretch ? scaleX : Math.min(scaleX, scaleY);
    const effectiveScaleY = stretch ? scaleY : Math.min(scaleX, scaleY);

    // Re-calculate centering if not stretching
    const finalOffsetX = stretch ? offsetX : (canvasWidth - (BASE_WIDTH * effectiveScaleX)) / 2;
    const finalOffsetY = stretch ? offsetY : (canvasHeight - (BASE_HEIGHT * effectiveScaleY)) / 2;

    // Calculate absolute center for the frame
    const frameWidth = frame.width * effectiveScaleX;
    const frameHeight = frame.height * effectiveScaleY;
    const centerX = (frame.left * effectiveScaleX) + finalOffsetX + frameWidth / 2;
    const centerY = (frame.top * effectiveScaleY) + finalOffsetY + frameHeight / 2;

    const rect = new Rect({
      left: centerX,
      top: centerY,
      width: frameWidth,
      height: frameHeight,
      originX: 'center',
      originY: 'center',
      fill: '#f8f9fa', // Light grey placeholder
      stroke: '#e0e0e0', // Subtle border
      strokeWidth: 1,
      selectable: true,
      hasControls: true,
      lockScalingX: false,
      lockScalingY: false,
      strokeUniform: true
    });

    // Use custom property
    (rect as any).id = uuidv4();
    (rect as any).isFrame = true;

    groupObjects.push(rect);


  });

  const group = new Group(groupObjects, {
    // Let Fabric calculate the group's bounding box from the objects
    subTargetCheck: true,
    interactive: true,
  });

  // Re-center the group object itself to be safe, or just let the items define it.
  // Group creation from items sets its width/height/left/top based on items.
  // So we just add it.

  // Tag the group
  (group as any).isCollageGroup = true;

  canvas.add(group);
  canvas.centerObject(group); // Ensure perfect centering
  canvas.setActiveObject(group);
  canvas.requestRenderAll();
};

export const addImageToFrame = (canvas: Canvas, frame: Rect, img: FabricImage) => {
  // Calculate absolute dimensions and position using getBoundingRect()
  const rect = frame.getBoundingRect();

  // Account for stroke width to place image INSIDE the border
  const strokeWidth = frame.strokeWidth || 0;

  const absoluteLeft = rect.left + strokeWidth / 2;
  const absoluteTop = rect.top + strokeWidth / 2;
  const frameWidth = rect.width - strokeWidth;
  const frameHeight = rect.height - strokeWidth;

  // Calculate absolute center of the frame
  const centerX = absoluteLeft + frameWidth / 2;
  const centerY = absoluteTop + frameHeight / 2;


  // 1. Calculate image scale to cover the frame
  const scale = Math.max(frameWidth / img.width, frameHeight / img.height);
  img.scale(scale);

  // 2. Center image using origin (more robust than top/left calc)
  img.set({
    originX: 'center',
    originY: 'center',
    left: centerX,
    top: centerY,
  });

  // 3. ClipPath: Clone frame logic
  frame.clone().then((clonedFrame: any) => {
    // We want the clip path to match the INNER area exactly
    clonedFrame.set({
      originX: 'center',
      originY: 'center',
      left: centerX,
      top: centerY,
      width: frameWidth,
      height: frameHeight,
      scaleX: 1,
      scaleY: 1,
      angle: 0,
      absolutePositioned: true,
      group: null,
      strokeWidth: 0, // IMPORTANT: Clip path itself should not have stroke
      stroke: null
    });

    img.clipPath = clonedFrame;

    canvas.add(img);
    canvas.setActiveObject(img);
    canvas.requestRenderAll();
  });
};
