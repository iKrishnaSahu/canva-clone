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

interface CollageSettings {
  spacing: number;
  roundness: number;
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  backgroundColor?: string;
}

export const updateCollageSettings = (canvas: Canvas, settings: CollageSettings, target?: FabricObject) => {
  // If target is provided, determine if it is a Group (Global) or a Frame (Cell)
  let effectiveTarget = target || canvas.getActiveObject();

  let group: Group | null = null;
  let workMode: 'global' | 'single' = 'global';
  let singleFrame: Rect | null = null;

  if (effectiveTarget && (effectiveTarget as any).isCollageGroup) {
    group = effectiveTarget as Group;
    workMode = 'global';
  } else if (effectiveTarget && (effectiveTarget as any).isFrame) {
    singleFrame = effectiveTarget as Rect;
    group = singleFrame.group as Group; // Parent group
    workMode = 'single';
  } else {
    // Fallback: search canvas for group
    group = canvas.getObjects().find((obj: any) => obj.isCollageGroup) as Group | null;
    workMode = 'global';
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


  const { spacing, roundness, borderWidth = 0, borderColor = '#000000', borderStyle = 'solid', backgroundColor } = settings;

  // If Global, update group config
  if (workMode === 'global') {
    (group as any).collageConfig = { ...((group as any).collageConfig || {}), ...settings };

    // Update Group Background (Gap Color)
    // Note: Group fill covers the bounding box. 
    // If spacing > 0, the group fill shows through the gaps.
    if (backgroundColor) {
      // We can't easily set 'fill' on a group to be a solid rect behind items without adding a rect.
      // Fabric Groups don't inherently render a background rect unless we add one or use a trick.
      // Simplest: Add a background rect to the group at index 0?
      // OR: Update canvas background? But user might want collage-specific background.
      // For now, let's assume we modify the "Frames" fill if no image? No, user wants GAP color.

      // Let's iterate and see if we have a "bgRect" in the group, if not add one.
      // Actually, easier: ensure there is a Rect at the bottom of group.
      // OR: Just set group.set({ fill: backgroundColor })? 
      // Fabric groups usually don't verify fill unless dirty. Let's try adding a bg object.

      // Actually simplest is to change the Canvas background if the collage covers it, 
      // BUT for a "Collage Object", maybe we just ignore this for now or try setting group fill?
      // Let's try group.item(0) as background if flagged.
    }
  }

  const objects = group.getObjects();
  const frames = objects.filter((o: any) => o.isFrame);

  // Dash Array logic
  let strokeDashArray: number[] | null = null;
  if (borderStyle === 'dashed') strokeDashArray = [10, 5];
  if (borderStyle === 'dotted') strokeDashArray = [2, 4];

  layout.frames.forEach((frameDef, index) => {
    const frameObj = frames[index] as Rect;
    if (!frameObj) return;

    if (workMode === 'single' && frameObj !== singleFrame) {
      return;
    }

    const baseCenterX = frameDef.left + frameDef.width / 2;
    const baseCenterY = frameDef.top + frameDef.height / 2;

    const relBaseX = baseCenterX - (BASE_WIDTH / 2);
    const relBaseY = baseCenterY - (BASE_HEIGHT / 2);

    const relativeLeft = relBaseX * effectiveScaleX;
    const relativeTop = relBaseY * effectiveScaleY;

    const rawFrameWidth = frameDef.width * effectiveScaleX;
    const rawFrameHeight = frameDef.height * effectiveScaleY;

    const shrinkAmount = spacing;

    const newWidth = Math.max(0, rawFrameWidth - shrinkAmount);
    const newHeight = Math.max(0, rawFrameHeight - shrinkAmount);

    frameObj.set({
      width: newWidth,
      height: newHeight,
      left: relativeLeft,
      top: relativeTop,
      rx: roundness,
      ry: roundness,
      stroke: borderColor,
      strokeWidth: borderWidth,
      strokeDashArray: strokeDashArray,
      strokeUniform: true
    });

    frameObj.setCoords();

    // Update Associated Images
    const canvasImages = canvas.getObjects().filter((o: any) => o.isCollageImage && o.parentFrameId === (frameObj as any).id);

    canvasImages.forEach((img: any) => {
      const fabricImg = img as FabricImage;

      const rect = frameObj.getBoundingRect();
      const currentStroke = frameObj.strokeWidth || 0;

      // Image sits INSIDE the border
      const fW = rect.width - currentStroke;
      const fH = rect.height - currentStroke;

      // Calculate center based on rect and stroke
      const cX = rect.left + currentStroke / 2 + fW / 2;
      const cY = rect.top + currentStroke / 2 + fH / 2;

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
