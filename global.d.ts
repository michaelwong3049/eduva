export {};

declare global {
  interface Window {
    nativeBits: {
      onScreenshotCaptured: (callback: (dataURL: string) => void) => void;
      sendToWhitebaord: (dataURL: string) => void;
      getMousePosition: () => Promise<Position>;
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
