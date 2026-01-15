import { BrowserWindow, screen } from 'electron';
import path from 'node:path';

export function loadWindow(window: BrowserWindow, url: string): void {
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    window.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/${url}`);
  } else {
    window.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/${url}`)
    );
  }
}

export function createMainWindow(width: number, height: number): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: width,
    height: height,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  loadWindow(mainWindow, "index.html");

  return mainWindow;
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
  overlay.setSkipTaskbar(true);
  overlay.setMenuBarVisibility(true);

  loadWindow(overlay, "screenshot-overlay.html");

  return overlay
}

export function createButtonNotification(): BrowserWindow {
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

  loadWindow(overlay, "button-overlay.html");

  return overlay;
}

export function createWhiteboardOverlay(): BrowserWindow {
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
  overlay.setSkipTaskbar(true);
  overlay.setMenuBarVisibility(true);

  loadWindow(overlay, "whiteboard-overlay.html");

  return overlay
}

