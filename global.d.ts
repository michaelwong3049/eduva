export {};

declare global {
  interface Window {
    nativeBits: {
      // captureScreenshot: (width: number, height: number) => Promise<string>;
      onScreenshotCaptured: (callback: (dataURL: string) => void) => void;
      sendToMain: (dataURL: string) => void;
      // getMousePosition: (callback: (position: Position) => void) => void;
      getMousePosition: () => Promise<Position>;
      closeWhiteboardOverlay: () => void;
    }
  }
}

export type Position = {
  x: number;
  y: number;
}

// reference rectangle coordinate position relative to https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
export type ScreenshotRegion = {
  left: number;
  top: number;
  width: number;
  height: number;
}
