import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('nativeBits', {
  // captureScreenshot: (width: number, height: number) => ipcRenderer.invoke('captureScreenshot', width, height),
  onScreenshotCaptured: (callback: (dataURL: string) => void) => {
    ipcRenderer.on('screenshot:captured', (_event, dataURL: string) => callback(dataURL));
  },
  sendToMain: (dataURL: string) => ipcRenderer.send('screenshot:sendToMain', dataURL),
  getMousePosition: () => ipcRenderer.invoke('mouse:getPosition').then((position) => {
    return position;
  })
})
