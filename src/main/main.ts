import { screen, app, BrowserWindow, globalShortcut, desktopCapturer, ipcMain, session } from 'electron';
import { createMainWindow, createScreenshotOverlayWindow, createButtonNotification, createWhiteboardOverlay } from './windows/createWindow';
import path from 'node:path';
import started from 'electron-squirrel-startup';

if (started) {
  app.quit();
}

let mainWindow: BrowserWindow | null;
let screenshotOverlay: BrowserWindow | null;
let buttonNotification: BrowserWindow | null;
let whiteboardOverlay: BrowserWindow | null;

app.commandLine.appendSwitch('enable-features', 'GlobalShortcutsPortal')

// handle screenshot keybinding
app.whenReady().then(() => {
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

