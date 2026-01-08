import { BrowserWindow } from 'electron';
import path from 'node:path';

export function ScreenshotOverlay() {
  const overlay = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    fullscreen: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    },
  })

  overlay.setAlwaysOnTop(true, 'screen-saver');
  overlay.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  overlay.setFullScreen(true);
  overlay.setSkipTaskbar(true);
  overlay.setMenuBarVisibility(false);

  return overlay
}
