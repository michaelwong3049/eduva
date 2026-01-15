import { BrowserWindow, screen } from 'electron';
import path from 'node:path';

export async function getImageDimensions(image: string): Promise<{ width: number; height: number }> {
  const res = await fetch(image);
  const blob = await res.blob();
  const imageBitmap = await createImageBitmap(blob);
  const size = { width: imageBitmap.width, height: imageBitmap.height };
  imageBitmap.close?.();
  return size;
}

export function createScreenshotOverlayWindow(): BrowserWindow {
  const { x, y, width, height } = screen.getPrimaryDisplay().bounds;

  const overlay = new BrowserWindow({
    x,
    y,
    width: width,
    height: height,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    simpleFullscreen: true,
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
  overlay.setSimpleFullScreen(true);
  // overlay.setFullScreen(true);
  overlay.setSkipTaskbar(true);
  overlay.setMenuBarVisibility(true);

  return overlay
}

export function createOpenWhiteboardButtonOverlay(): BrowserWindow {
  const { x, y, width, height } = screen.getPrimaryDisplay().bounds;

  const overlay = new BrowserWindow({
    x,
    y,
    width: width,
    height: height,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    simpleFullscreen: true,
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
  overlay.setSimpleFullScreen(true);
  // overlay.setFullScreen(true);
  overlay.setSkipTaskbar(true);
  overlay.setMenuBarVisibility(true);
  overlay.setIgnoreMouseEvents(true);

  return overlay;
}
