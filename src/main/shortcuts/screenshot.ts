import { BrowserWindow, screen } from 'electron';
import path from 'node:path';

export function createScreenshotOverlayWindow(): BrowserWindow {
  const point = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(point);
  const { x, y, width, height } = display.bounds;

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
