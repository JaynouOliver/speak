import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;
let recordingWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV !== 'production';

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createRecordingWindow() {
  recordingWindow = new BrowserWindow({
    width: 300,
    height: 100,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const recordingUrl = isDev
    ? 'http://localhost:3000/recording'
    : `file://${path.join(__dirname, '../build/index.html#/recording')}`;

  recordingWindow.loadURL(recordingUrl);
  recordingWindow.setAlwaysOnTop(true, 'floating');
  recordingWindow.setVisibleOnAllWorkspaces(true);
  recordingWindow.setFullScreenable(false);

  // Position the window at the top center of the screen
  const { width } = require('electron').screen.getPrimaryDisplay().workAreaSize;
  recordingWindow.setPosition(Math.floor((width - 300) / 2), 20);

  recordingWindow.on('closed', () => {
    recordingWindow = null;
  });
}

function registerGlobalShortcuts() {
  // Toggle recording window with Option+Space+1
  globalShortcut.register('Option+Space+1', () => {
    if (recordingWindow && recordingWindow.isVisible()) {
      recordingWindow.hide();
      mainWindow?.webContents.send('recording-stopped');
    } else {
      if (!recordingWindow) {
        createRecordingWindow();
      } else {
        recordingWindow.show();
      }
      mainWindow?.webContents.send('recording-started');
    }
  });

  // Close recording window with Escape
  globalShortcut.register('Escape', () => {
    if (recordingWindow && recordingWindow.isVisible()) {
      recordingWindow.hide();
      mainWindow?.webContents.send('recording-stopped');
    }
  });
}

app.whenReady().then(() => {
  createMainWindow();
  registerGlobalShortcuts();

  // IPC handlers
  ipcMain.on('close-recording-window', () => {
    if (recordingWindow) {
      recordingWindow.hide();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Clean up on quit
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});