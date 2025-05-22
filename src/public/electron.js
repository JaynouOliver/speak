const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');

let isDev = false;

// Dynamically import electron-is-dev
import('electron-is-dev').then(module => {
  isDev = module.default;
}).catch(err => {
  console.error('Failed to load electron-is-dev:', err);
});

let mainWindow;
let recordingWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js')
    },
    frame: false,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#1e1e1e',
    show: false
  });

  // Load the index.html of the app.
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../build/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Show the window when it's ready to show
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Create the recording window (initially hidden)
  createRecordingWindow();

  // Register global shortcuts
  registerGlobalShortcuts();
}

function createRecordingWindow() {
  recordingWindow = new BrowserWindow({
    width: 300,
    height: 100,
    x: 0,
    y: 0,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    show: false
  });

  recordingWindow.loadURL(
    isDev 
      ? 'http://localhost:3000/#/recording' 
      : `file://${path.join(__dirname, '../build/index.html#/recording')}`
  );

  // Hide the window when it's ready to show
  recordingWindow.once('ready-to-show', () => {
    // Position the window at the top center of the screen
    const { width } = require('electron').screen.getPrimaryDisplay().workAreaSize;
    recordingWindow.setPosition(Math.floor((width - 300) / 2), 20);
  });
}

function registerGlobalShortcuts() {
  // Register Option + Space + 1 to show/hide the recording window
  const ret = globalShortcut.register('Option+Space+1', () => {
    if (recordingWindow) {
      if (recordingWindow.isVisible()) {
        recordingWindow.hide();
        mainWindow.webContents.send('recording-stopped');
      } else {
        recordingWindow.show();
        mainWindow.webContents.send('recording-started');
      }
    }
  });

  if (!ret) {
    console.log('Registration of Option+Space+1 failed');
  }

  // Register Escape to hide the recording window
  const ret2 = globalShortcut.register('Escape', () => {
    if (recordingWindow && recordingWindow.isVisible()) {
      recordingWindow.hide();
      mainWindow.webContents.send('recording-stopped');
    }
  });

  if (!ret2) {
    console.log('Registration of Escape failed');
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
  
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC communication
ipcMain.on('start-recording', (event) => {
  // Handle starting the recording
  mainWindow.webContents.send('recording-status', 'recording');
});

ipcMain.on('stop-recording', (event) => {
  // Handle stopping the recording
  mainWindow.webContents.send('recording-status', 'stopped');
  if (recordingWindow) {
    recordingWindow.hide();
  }
});

// Handle the app before it quits
app.on('will-quit', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
});
