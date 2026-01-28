import { contextBridge, ipcRenderer } from 'electron';

import type { ExcalidrawCircleElement } from '../types';

contextBridge.exposeInMainWorld('nativeBits', {
  onScreenshotCaptured: (callback: (dataURL: string) => void) => {
    ipcRenderer.on('screenshot:captured', (_event, dataURL: string) => callback(dataURL));
  },
  sendToWhiteboard: (dataURL: string) => ipcRenderer.send('screenshot:sendToWhiteboard', dataURL),
  getMousePosition: () => ipcRenderer.invoke('mouse:getPosition').then((position) => {
    return position;
  }),
  onGeminiRequest: (callback: (message: string ) => void) => {
    ipcRenderer.on("gemini:getMessage", (_event, message: string) => {
      callback(message);
    })
  },
  addCircleToWhiteboard: (circle: ExcalidrawCircleElement) => {
    ipcRenderer.send('whiteboard:addCircle', circle);
  },
  requestClaude: (query: string) => ipcRenderer.invoke('mcp:query', query).then((circle) => {
    return circle;
  }),
  onAddCircle: (callback: (circle: ExcalidrawCircleElement) => void) => {
    const handler = (_event: any, circle: ExcalidrawCircleElement) => callback(circle);

    ipcRenderer.on('whiteboard:addCircle', handler);

    return () => {
      ipcRenderer.removeListener("whiteboard:addCircle", handler);
    }
  }
})
