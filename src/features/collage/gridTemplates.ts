export interface GridFrame {
  left: number;
  top: number;
  width: number;
  height: number;
  fill: string;
}

export interface GridLayout {
  name: string;
  frames: GridFrame[];
}

const BASE_WIDTH = 400;
const BASE_HEIGHT = 400;
const GAP = 10;

export const GRID_TEMPLATES: GridLayout[] = [
  {
    name: 'Single',
    frames: [
      { left: 0, top: 0, width: BASE_WIDTH, height: BASE_HEIGHT, fill: '#e0e0e0' }
    ]
  },
  {
    name: 'Split Vertical',
    frames: [
      { left: 0, top: 0, width: (BASE_WIDTH - GAP) / 2, height: BASE_HEIGHT, fill: '#e0e0e0' },
      { left: (BASE_WIDTH + GAP) / 2, top: 0, width: (BASE_WIDTH - GAP) / 2, height: BASE_HEIGHT, fill: '#cfcfcf' }
    ]
  },
  {
    name: 'Split Horizontal',
    frames: [
      { left: 0, top: 0, width: BASE_WIDTH, height: (BASE_HEIGHT - GAP) / 2, fill: '#e0e0e0' },
      { left: 0, top: (BASE_HEIGHT + GAP) / 2, width: BASE_WIDTH, height: (BASE_HEIGHT - GAP) / 2, fill: '#cfcfcf' }
    ]
  },
  {
    name: 'Four Grid',
    frames: [
      { left: 0, top: 0, width: (BASE_WIDTH - GAP) / 2, height: (BASE_HEIGHT - GAP) / 2, fill: '#e0e0e0' },
      { left: (BASE_WIDTH + GAP) / 2, top: 0, width: (BASE_WIDTH - GAP) / 2, height: (BASE_HEIGHT - GAP) / 2, fill: '#cfcfcf' },
      { left: 0, top: (BASE_HEIGHT + GAP) / 2, width: (BASE_WIDTH - GAP) / 2, height: (BASE_HEIGHT - GAP) / 2, fill: '#bfbfbf' },
      { left: (BASE_WIDTH + GAP) / 2, top: (BASE_HEIGHT + GAP) / 2, width: (BASE_WIDTH - GAP) / 2, height: (BASE_HEIGHT - GAP) / 2, fill: '#d9d9d9' }
    ]
  },
  {
    name: 'Grid 1-2',
    frames: [
      { left: 0, top: 0, width: (BASE_WIDTH - GAP) / 2, height: BASE_HEIGHT, fill: '#e0e0e0' },
      { left: (BASE_WIDTH + GAP) / 2, top: 0, width: (BASE_WIDTH - GAP) / 2, height: BASE_HEIGHT, fill: '#cfcfcf' }
    ]
  },
  {
    name: 'Three V-Split',
    frames: [
      { left: 0, top: 0, width: (BASE_WIDTH - GAP) / 2, height: BASE_HEIGHT, fill: '#e0e0e0' },
      { left: (BASE_WIDTH + GAP) / 2, top: 0, width: (BASE_WIDTH - GAP) / 2, height: (BASE_HEIGHT - GAP) / 2, fill: '#cfcfcf' },
      { left: (BASE_WIDTH + GAP) / 2, top: (BASE_HEIGHT + GAP) / 2, width: (BASE_WIDTH - GAP) / 2, height: (BASE_HEIGHT - GAP) / 2, fill: '#bfbfbf' }
    ]
  },
  {
    name: 'Three H-Split',
    frames: [
      { left: 0, top: 0, width: BASE_WIDTH, height: (BASE_HEIGHT - GAP) / 2, fill: '#e0e0e0' },
      { left: 0, top: (BASE_HEIGHT + GAP) / 2, width: (BASE_WIDTH - GAP) / 2, height: (BASE_HEIGHT - GAP) / 2, fill: '#cfcfcf' },
      { left: (BASE_WIDTH + GAP) / 2, top: (BASE_HEIGHT + GAP) / 2, width: (BASE_WIDTH - GAP) / 2, height: (BASE_HEIGHT - GAP) / 2, fill: '#bfbfbf' }
    ]
  },
  {
    name: 'Six Grid',
    frames: [
      { left: 0, top: 0, width: (BASE_WIDTH - 2 * GAP) / 3, height: (BASE_HEIGHT - GAP) / 2, fill: '#e0e0e0' },
      { left: (BASE_WIDTH + GAP) / 3, top: 0, width: (BASE_WIDTH - 2 * GAP) / 3, height: (BASE_HEIGHT - GAP) / 2, fill: '#e0e0e0' },
      { left: (2 * (BASE_WIDTH + GAP)) / 3, top: 0, width: (BASE_WIDTH - 2 * GAP) / 3, height: (BASE_HEIGHT - GAP) / 2, fill: '#e0e0e0' },
      { left: 0, top: (BASE_HEIGHT + GAP) / 2, width: (BASE_WIDTH - 2 * GAP) / 3, height: (BASE_HEIGHT - GAP) / 2, fill: '#cfcfcf' },
      { left: (BASE_WIDTH + GAP) / 3, top: (BASE_HEIGHT + GAP) / 2, width: (BASE_WIDTH - 2 * GAP) / 3, height: (BASE_HEIGHT - GAP) / 2, fill: '#cfcfcf' },
      { left: (2 * (BASE_WIDTH + GAP)) / 3, top: (BASE_HEIGHT + GAP) / 2, width: (BASE_WIDTH - 2 * GAP) / 3, height: (BASE_HEIGHT - GAP) / 2, fill: '#cfcfcf' }
    ]
  }
];
