import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('nativeBits', {
  onScreenshotCaptured: (callback: (dataURL: string) => void) => {
    ipcRenderer.on('screenshot:captured', (_event, dataURL: string) => callback(dataURL));
  },
  sendToWhiteboard: (dataURL: string) => ipcRenderer.send('screenshot:sendToWhiteboard', dataURL),
  getMousePosition: () => ipcRenderer.invoke('mouse:getPosition').then((position) => {
    return position;
  }),
})
