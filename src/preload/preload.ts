import { contextBridge, ipcRenderer } from 'electron';
import type { Position } from 'global.d.ts';

contextBridge.exposeInMainWorld('nativeBits', {
  // captureScreenshot: (width: number, height: number) => ipcRenderer.invoke('captureScreenshot', width, height),
  onScreenshotCaptured: (callback: (dataURL: string) => void) => {
    ipcRenderer.on('screenshot:captured', (_event, dataURL: string) => callback(dataURL));
    // ipcRenderer.invoke('screenshotStartingPosition', )
  },
  getMousePosition: () => ipcRenderer.invoke('mouse:getPosition').then((position) => {
    return position;
  })
})
