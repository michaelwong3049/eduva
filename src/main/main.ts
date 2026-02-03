import { screen, app, BrowserWindow, globalShortcut, desktopCapturer, ipcMain, session } from 'electron';
import { createMainWindow, createScreenshotOverlayWindow, createButtonNotification, createWhiteboardOverlay } from './createWindow';

import path from 'node:path';
import started from 'electron-squirrel-startup';
import "dotenv/config";

import { MCPClient } from "../mcp/client";

if (started) {
  app.quit();
}

let mainWindow: BrowserWindow | null;
let screenshotOverlay: BrowserWindow | null;
let buttonNotification: BrowserWindow | null;
let whiteboardOverlay: BrowserWindow | null;
let mcpClient: MCPClient | null = null;

app.commandLine.appendSwitch('enable-features', 'GlobalShortcutsPortal')

// handle screenshot keybinding
app.whenReady().then(async () => {
  const display = screen.getPrimaryDisplay();
  const { width, height } = display.bounds;
  const scaleFactor = display.scaleFactor;

  const ret = globalShortcut.register('CommandOrControl+X', async () => {
    console.log('--- Screenshot command was pressed ---');

    if (screenshotOverlay) {
      console.warn('screenshot already happening, not starting another');
      return;
    }

    screenshotOverlay = createScreenshotOverlayWindow();

    // stop screenshotting action
    globalShortcut.register('Escape', () => {
      screenshotOverlay?.close();
      screenshotOverlay = null;
      globalShortcut.unregister('Escape');
    });

    screenshotOverlay.webContents.once('did-finish-load', async () => {
      try {
        // Use scaled dimensions for full Retina/HiDPI resolution
        const sources = await desktopCapturer.getSources({
          types: ['screen'],
          thumbnailSize: {
            width: Math.floor(width * scaleFactor),
            height: Math.floor(height * scaleFactor)
          }
        })

        const dataURL = sources[0].thumbnail.toDataURL();

        screenshotOverlay?.webContents.send('screenshot:captured', dataURL);
      } catch (error) {
        console.error(error);
      }
    })
  })

  if (!ret) {
    console.log('registration failed')
  }

  console.log(globalShortcut.isRegistered('CommandOrControl+X'))
  mainWindow = createMainWindow(width, height);
})

// handles sending screenshot to the whiteboard
app.whenReady().then(() => {
  ipcMain.on('screenshot:sendToWhiteboard', (event_, dataURL) => {
    screenshotOverlay?.close();
    screenshotOverlay = null;
    globalShortcut.unregister('Escape');

    if (whiteboardOverlay) {
      whiteboardOverlay?.close();
      whiteboardOverlay = null;
    }

    buttonNotification = createButtonNotification();
    whiteboardOverlay = createWhiteboardOverlay();

    whiteboardOverlay?.webContents.once('did-finish-load', () => {
      console.log("finished?");
      whiteboardOverlay?.webContents.send('screenshot:captured', dataURL);

      globalShortcut.register('Command+Alt+K', () => {
        if (whiteboardOverlay?.isVisible()) {
          whiteboardOverlay.hide();
        } else {
          // Load the whiteboard overlay HTML
          whiteboardOverlay?.show();
        }
      })
    })
  })
})

// handles adding shape elements to the whiteboard
app.whenReady().then(() => {
  ipcMain.on('whiteboard:addShape', (_event, shape) => {
    if (whiteboardOverlay) {
      whiteboardOverlay.webContents.send('whiteboard:addShape', shape);
    } else {
      console.warn('Whiteboard overlay not open, cannot add shape');
    }
  })
})

app.whenReady().then(async () => {
  // Initialize MCP first
  mcpClient = new MCPClient();
  try {
    await mcpClient.connectToServer('./dist/mcp/server.js');

    ipcMain.handle('mcp:query', async (_event, query, whiteboardData) => {
      return await mcpClient.processQuery(query, whiteboardData);
    })
  } catch (error) {
    console.error("Error: ", error);
  } 
})

app.whenReady().then(async () => {
  ipcMain.handle("get-whiteboard-data", () => {
    if (!whiteboardOverlay) {
      return null;
    }

    return new Promise((resolve) => {
      ipcMain.once("whiteboard:data-response", (_event, data) => {
        console.log("whiteboard's data: ", data);
        if (!data) {
          console.error("no data receieved");
        } 
        return resolve(data);
      })
      
      whiteboardOverlay.webContents.send("whiteboard:request-data");
    })
  })
});

app.on('will-quit', () => {
  globalShortcut.unregister('CommandOrControl+X')

  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  const { width, height } = screen.getPrimaryDisplay().bounds;

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createMainWindow(width, height);
  }
});

