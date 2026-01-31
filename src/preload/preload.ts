import { contextBridge, ipcRenderer } from 'electron';

import { ExcalidrawShapeElement } from 'src/types'; 

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
  addShapeToWhiteboard: (shape: ExcalidrawShapeElement) => {
    ipcRenderer.send('whiteboard:addShape', shape);
  },
  requestClaude: (query: string) => ipcRenderer.invoke('mcp:query', query).then((shape) => {
    return shape;
  }),
  onAddShape: (callback: (shape: ExcalidrawShapeElement) => void) => {
    const handler = (_event: any, shape: ExcalidrawShapeElement) => callback(shape);

    ipcRenderer.on('whiteboard:addShape', handler);

    return () => {
      ipcRenderer.removeListener("whiteboard:addShape", handler);
    }
  }
})
