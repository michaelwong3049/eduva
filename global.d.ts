import type { ExcalidrawShapeElement } from './src/types';

export {};

declare global {
  interface Window {
    nativeBits: {
      onScreenshotCaptured: (callback: (dataURL: string) => void) => void;
      sendToWhiteboard: (dataURL: string) => void;
      getMousePosition: () => Promise<Position>;
      closeWhiteboardOverlay: () => void;
      onGeminiRequest: (callback: (dataURL: string) => void) => void;
      addShapeToWhiteboard: (shape: ExcalidrawShapeElement) => void;
      requestClaude: (query: string) => Promise<ExcalidrawShapeElement>;
      onAddShape: (callback: (shape: ExcalidrawShapeElement) => void) => void;
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
