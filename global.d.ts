import type { ExcalidrawShapeElement } from './src/types';
import { NonDeletedExcalidrawElement } from '@excalidraw/excalidraw/dist/types/excalidraw/element/types';

declare global {
  interface Window {
    nativeBits: {
      onScreenshotCaptured: (callback: (dataURL: string) => void) => void;
      sendToWhiteboard: (dataURL: string) => void;
      getMousePosition: () => Promise<Position>;
      closeWhiteboardOverlay: () => void;
      onGeminiRequest: (callback: (dataURL: string) => void) => void;
      addShaeeToWhiteboard: (shape: ExcalidrawShapeElement) => void;
      requestClaude: (query: string, whiteboardData: WhiteboardData) => Promise<ExcalidrawShapeElement>;
      onRequestWhiteboardData: (callback: () => void) => void;
      sendWhiteboardDataResponse: (data: WhiteboardData | null) => void;
      getWhiteboardData: () => Promise<WhiteboardData>;
      addShapeToWhiteboard: (shape: ExcalidrawShapeElement) => void;
    }
  }
}

export type WhiteboardData = {
  elements: readonly Ordered<NonDeletedExcalidrawElement>[];
  screenshot: string;
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
