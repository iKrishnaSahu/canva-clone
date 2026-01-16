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

  // Tag the group and store metadata for upgrades
  (group as any).isCollageGroup = true;
  (group as any).originalLayout = JSON.parse(JSON.stringify(layout)); // Deep copy
  (group as any).baseScaleX = availableWidth / BASE_WIDTH; // approximation for storage
  (group as any).baseScaleY = availableHeight / BASE_HEIGHT; // approximation
  (group as any).collageConfig = { spacing: 0, roundness: 0 };

  canvas.add(group);
  canvas.centerObject(group); // Ensure perfect centering
  canvas.setActiveObject(group);
  canvas.requestRenderAll();
};

export const addImageToFrame = (canvas: Canvas, frame: Rect, img: FabricImage) => {
  const setupImage = () => {
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
        stroke: null,
        rx: frame.rx, // Maintain roundness
        ry: frame.ry
      });

      img.clipPath = clonedFrame;

      // Link image to frame for updates
      (img as any).parentFrameId = (frame as any).id;
      (img as any).isCollageImage = true;

      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.requestRenderAll();
    });
  };

  // If image is already on canvas, we might be updating it, but usually this func adds NEW image
  setupImage();
};

export const updateCollageSettings = (canvas: Canvas, settings: { spacing: number; roundness: number }, target?: FabricObject) => {
  // If target is provided, determine if it is a Group (Global) or a Frame (Cell)
  // If no target, use active object or find group.

  let effectiveTarget = target || canvas.getActiveObject();

  // Find the parent group if we are selecting a single frame inside (or if we passed a frame)
  // Actually, frames are inside the group. Fabric selection might give us the Group with subTargets?
  // Or if we select a cell, we might get the Frame directly if `subTargetCheck` is mostly for events but selection is usually group.
  // Wait, `subTargetCheck: true` on group allows events on children, but selection?
  // Usually Fabric selects the Group.
  // To support cell selection, the user might need to double click or we need to handle it.
  // For now, let's assume if the user selects a Frame (Rect with isFrame), we update that.

  let group: Group | null = null;
  let workMode: 'global' | 'single' = 'global';
  let singleFrame: Rect | null = null;

  if (effectiveTarget && (effectiveTarget as any).isCollageGroup) {
    group = effectiveTarget as Group;
    workMode = 'global';
  } else if (effectiveTarget && (effectiveTarget as any).isFrame) {
    // It is a single frame. We need its parent group to get metadata/layout context?
    // Actually, frames are inside the group. Fabric's ActiveObject might be the group, 
    // but maybe we are using the "subTarget" logic from events? 
    // Or maybe the user extracted the frame? No.
    // If we want to support single cell selection, we might need to rely on `canvas.getActiveObject()` returning the group,
    // and then we check `canvas.getActiveObjects()`? 
    // Fabric 6 Group selection: typically you select the Group. 
    // Implementing actual "Single Cell Selection" inside a Group is tricky in Fabric without "ungrouping" visually.
    // BUT, if the user "drills down" (double click?) or if we use the "Edit Layout" mode.

    // Let's assume for this request: The User selects the Group, but we might have a mechanism to specify "which cell".
    // OR, the User selects a specific cell (sub-selection).
    // Given the `CollagePanel` change plan, we listen to selection.

    // If `effectiveTarget` IS the frame (e.g. from sub-selection), we use it. 
    singleFrame = effectiveTarget as Rect;
    group = singleFrame.group as Group; // Parent group
    workMode = 'single';
  } else {
    // Fallback: search canvas for group
    group = canvas.getObjects().find((obj: any) => obj.isCollageGroup) as Group | null;
    workMode = 'global'; // default to global if auto-finding
  }

  if (!group || !(group as any).originalLayout) return;

  const layout = (group as any).originalLayout as GridLayout;

  // Recalculate context (same as before)
  const margin = 50;
  const canvasWidth = canvas.width || 800;
  const canvasHeight = canvas.height || 600;
  const availableWidth = canvasWidth - (margin * 2);
  const availableHeight = canvasHeight - (margin * 2);

  const BASE_WIDTH = 400;
  const BASE_HEIGHT = 400;

  const scaleX = availableWidth / BASE_WIDTH;
  const scaleY = availableHeight / BASE_HEIGHT;
  const stretch = true;

  const effectiveScaleX = stretch ? scaleX : Math.min(scaleX, scaleY);
  const effectiveScaleY = stretch ? scaleY : Math.min(scaleX, scaleY);



  const { spacing, roundness } = settings;

  // If Global, update group config
  if (workMode === 'global') {
    (group as any).collageConfig = settings;
  }

  const objects = group.getObjects();
  const frames = objects.filter((o: any) => o.isFrame);

  layout.frames.forEach((frameDef, index) => {
    const frameObj = frames[index] as Rect;
    if (!frameObj) return;

    // Determine if we should update this frame
    if (workMode === 'single' && frameObj !== singleFrame) {
      return; // Skip non-target frames
    }

    // Recover specific settings for this frame or use global/passed settings?
    // If 'global' mode, we apply 'settings' to ALL.
    // If 'single' mode, we apply 'settings' ONLY to this frame.
    // BUT we need to preserve the state of others? 
    // Wait, if I change ONE cell, the others should stay as they are.
    // So 'updateCollageSettings' logic needs to be careful. 
    // Currently, it iterates ALL and applies 'settings'. 
    // If we only process 'singleFrame', the others are untouched (preserved).

    // HOWEVER, for 'spacing' (padding), we need the base geometry to shrink FROM.
    // Recalculating from 'layout' + 'spacing' is correct.

    // Fix: Use Relative Coordinates for Group
    // The group's origin is at its center (0,0).
    // We need to calculate the frame's center relative to the grid center (200, 200 for 400x400 base).

    // 1. Find original center in Base Layout space (0-400)
    const baseCenterX = frameDef.left + frameDef.width / 2;
    const baseCenterY = frameDef.top + frameDef.height / 2;

    // 2. Find offset from Base Center (200, 200)
    const relBaseX = baseCenterX - (BASE_WIDTH / 2);
    const relBaseY = baseCenterY - (BASE_HEIGHT / 2);

    // 3. Scale to current size
    const relativeLeft = relBaseX * effectiveScaleX;
    const relativeTop = relBaseY * effectiveScaleY;

    // Note: We do NOT add finalOffsetX/Y because those position the GROUP on the canvas.
    // The objects INSIDE the group use coordinates relative to the group center.

    const rawFrameWidth = frameDef.width * effectiveScaleX;
    const rawFrameHeight = frameDef.height * effectiveScaleY;

    const shrinkAmount = spacing; // Treat as Padding for single cell too

    const newWidth = Math.max(0, rawFrameWidth - shrinkAmount);
    const newHeight = Math.max(0, rawFrameHeight - shrinkAmount);

    frameObj.set({
      width: newWidth,
      height: newHeight,
      left: relativeLeft,
      top: relativeTop,
      rx: roundness,
      ry: roundness,
    });

    frameObj.setCoords();

    // Update Associated Images
    const canvasImages = canvas.getObjects().filter((o: any) => o.isCollageImage && o.parentFrameId === (frameObj as any).id);

    canvasImages.forEach((img: any) => {
      const fabricImg = img as FabricImage;

      const rect = frameObj.getBoundingRect();
      const strokeWidth = frameObj.strokeWidth || 0;

      const fW = rect.width - strokeWidth;
      const fH = rect.height - strokeWidth;
      const cX = rect.left + strokeWidth / 2 + fW / 2;
      const cY = rect.top + strokeWidth / 2 + fH / 2;

      const newScale = Math.max(fW / fabricImg.width, fH / fabricImg.height);

      fabricImg.set({
        scaleX: newScale,
        scaleY: newScale,
        left: cX,
        top: cY
      });

      if (fabricImg.clipPath) {
        const cp = fabricImg.clipPath;
        cp.set({
          left: cX,
          top: cY,
          width: fW,
          height: fH,
          rx: roundness,
          ry: roundness,
          scaleX: 1,
          scaleY: 1
        });
        cp.setCoords();
      }
    });
  });

  group.setCoords();
  canvas.requestRenderAll();
};
