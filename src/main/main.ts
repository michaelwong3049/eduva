import { screen, app, BrowserWindow, globalShortcut, desktopCapturer, ipcMain, session } from 'electron';
import { createScreenshotOverlayWindow, createOpenWhiteboardButtonOverlay } from '../lib';
import path from 'node:path';
import started from 'electron-squirrel-startup';

if (started) {
  app.quit();
}

let mainWindow: BrowserWindow | null;
let screenshotOverlay: BrowserWindow | null;
let openWhiteboardOverlay: BrowserWindow | null;

app.commandLine.appendSwitch('enable-features', 'GlobalShortcutsPortal')

const createWindow = (width: number, height: number) => {
  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  mainWindow.webContents.openDevTools();
};

// handles mouse position calculations for screenshot region
app.whenReady().then(() => {
  ipcMain.on('screenshot:sendToMain', (event_, dataURL) => {
    screenshotOverlay?.close();
    
    screenshotOverlay = null;
    globalShortcut.unregister('Escape');

    console.log("creating whiteboard butotn overlay");

    openWhiteboardOverlay = createOpenWhiteboardButtonOverlay();

    // // this loads the overlay window
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      openWhiteboardOverlay.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/open-whiteboard.html`);
      // screenshotOverlay.webContents.openDevTools({ mode: 'detach' }); // Add this line
    } else {
      openWhiteboardOverlay.loadFile(
        path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/open-whiteboard.html`)
      );
    }

    // openWhiteboardOverlay.webContents.openDevTools();
  })

  ipcMain.on('whiteboard-overlay:close', () => {
    openWhiteboardOverlay?.close();
    openWhiteboardOverlay = null;
  })
})

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

    // this loads the overlay window
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      screenshotOverlay.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/overlay.html`);
      // screenshotOverlay.webContents.openDevTools({ mode: 'detach' }); // Add this line
    } else {
      screenshotOverlay.loadFile(
        path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/overlay.html`)
      );
    }

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
  createWindow(width, height);
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
    createWindow(width, height);
  }
});

