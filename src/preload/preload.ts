import { contextBridge, ipcRenderer } from 'electron';
import { WhiteboardData } from 'global';

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
  requestClaude: (query: string, whiteboardScreenshot: string) => ipcRenderer.invoke('mcp:query', query, whiteboardScreenshot).then((shape) => {
    return shape;
  }),
  onRequestWhiteboardData: (callback: () => void) => {
    const handler = () => callback();

    ipcRenderer.on("whiteboard:request-data", handler);

    return () => {
      ipcRenderer.removeListener("whiteboard:request-data", handler);
    }
  },
  sendWhiteboardDataResponse: (data: WhiteboardData | null) => {
    ipcRenderer.send("whiteboard:data-response", data);
  },
  getWhiteboardData: () => ipcRenderer.invoke("get-whiteboard-data").then((whiteboardData) => {
    return whiteboardData;
  }),
  onAddShape: (callback: (shape: ExcalidrawShapeElement) => void) => {
    const handler = (_event: any, shape: ExcalidrawShapeElement) => callback(shape);

    ipcRenderer.on('whiteboard:addShape', handler);

    return () => {
      ipcRenderer.removeListener("whiteboard:addShape", handler);
    }
  }
})
