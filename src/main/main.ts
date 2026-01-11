import { screen, app, BrowserWindow, globalShortcut, desktopCapturer, ipcMain, session } from 'electron';
import { createScreenshotOverlayWindow } from './shortcuts/screenshot';
import path from 'node:path';
import started from 'electron-squirrel-startup';

if (started) {
  app.quit();
}

let mainWindow: BrowserWindow | null;
let screenshotOverlay: BrowserWindow | null;

app.commandLine.appendSwitch('enable-features', 'GlobalShortcutsPortal')

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
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

  // mainWindow.webContents.openDevTools();
};

// handles mouse position calculations for screenshot region
app.whenReady().then(() => {
  ipcMain.on('screenshot:sendToMain', (event_, dataURL) => {
    mainWindow?.webContents.send('screenshot:captured', dataURL);
    screenshotOverlay?.close();
    screenshotOverlay = null;
    globalShortcut.unregister('Escape');
  })

  ipcMain.handle('mouse:getPosition', () => {
    const point = screen.getCursorScreenPoint();
    const display = screen.getDisplayNearestPoint(point);

    return {
      x: (point.x - display.bounds.x) * display.scaleFactor,
      y: (point.y - display.bounds.y) * display.scaleFactor
    }
  })
})

// handle screenshot keybinding
app.whenReady().then(() => {
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
        const sources = await desktopCapturer.getSources({
          types: ['screen'],
          thumbnailSize: { width: 1920, height: 1080 }
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
  createWindow();
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
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

