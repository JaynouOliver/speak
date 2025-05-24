import { app, BrowserWindow, screen, globalShortcut } from 'electron';
import path from 'path';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let mainWindow: BrowserWindow;
let overlayWindow: BrowserWindow | null = null;
let isOverlayVisible = false;
let isQuitting = false;

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = (): void => {
  // Create main window first
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // Ensure dock is visible for main app on macOS
  if (process.platform === 'darwin' && app.dock) {
    app.dock.show();
  }

  mainWindow.on('closed', () => {
    console.log('Main window closed, destroying overlay');
    
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.destroy();
      overlayWindow = null;
    }
    
    mainWindow = null;
    
    if (!isQuitting) {
      app.quit();
    }
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // DevTools can be manually opened in development mode

  createOverlayWindow();
  setupGlobalShortcuts();
};

const createOverlayWindow = (): void => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  
  console.log('Screen dimensions:', { width, height });

  overlayWindow = new BrowserWindow({
    width: 300,
    height: 60,
    x: Math.floor((width - 300) / 2),
    y: height - 80,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: true,
    minimizable: false,
    maximizable: false,
    closable: true,
    focusable: false,
    hasShadow: true,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  overlayWindow.on('closed', () => {
    console.log('Overlay window closed');
    overlayWindow = null;
    isOverlayVisible = false;
  });

  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  overlayWindow.setAlwaysOnTop(true, 'screen-saver', 1);

  overlayWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Overlay</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background: rgba(0, 0, 0, 0.85);
        border-radius: 30px;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 60px;
        width: 300px;
        cursor: pointer;
        transition: all 0.3s ease;
        user-select: none;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        overflow: hidden;
      }
      
      .content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0;
        width: 100%;
      }
      
      .waveform {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 3px;
        height: 40px;
      }
      
      .bar {
        width: 3px;
        background: linear-gradient(to top, #ffffff, #cccccc);
        border-radius: 2px;
        transition: height 0.1s ease;
        animation: wave 1.2s ease-in-out infinite;
      }
      
      .bar:nth-child(1) { height: 8px; animation-delay: 0s; }
      .bar:nth-child(2) { height: 16px; animation-delay: 0.1s; }
      .bar:nth-child(3) { height: 12px; animation-delay: 0.2s; }
      .bar:nth-child(4) { height: 24px; animation-delay: 0.3s; }
      .bar:nth-child(5) { height: 20px; animation-delay: 0.4s; }
      .bar:nth-child(6) { height: 28px; animation-delay: 0.5s; }
      .bar:nth-child(7) { height: 16px; animation-delay: 0.6s; }
      .bar:nth-child(8) { height: 32px; animation-delay: 0.7s; }
      .bar:nth-child(9) { height: 24px; animation-delay: 0.8s; }
      .bar:nth-child(10) { height: 18px; animation-delay: 0.9s; }
      .bar:nth-child(11) { height: 14px; animation-delay: 1.0s; }
      .bar:nth-child(12) { height: 22px; animation-delay: 1.1s; }
      .bar:nth-child(13) { height: 26px; animation-delay: 1.2s; }
      .bar:nth-child(14) { height: 20px; animation-delay: 1.3s; }
      .bar:nth-child(15) { height: 12px; animation-delay: 1.4s; }
      
      @keyframes wave {
        0%, 100% { 
          transform: scaleY(0.3); 
          opacity: 0.6; 
        }
        50% { 
          transform: scaleY(1); 
          opacity: 1; 
        }
      }
    </style>
  </head>
  <body>
    <div class="content">
      <div class="waveform">
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
      </div>
    </div>

    <script>
      document.body.addEventListener('click', () => {
        alert('Overlay clicked from bottom center!');
      });

      document.body.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        window.close();
      });
    </script>
  </body>
  </html>
  `));

  console.log('Overlay window created at position:', overlayWindow.getPosition());
  console.log('Overlay window bounds:', overlayWindow.getBounds());
};

const setupGlobalShortcuts = (): void => {
  // Register Option+Space to show overlay
  const showShortcut = globalShortcut.register('Alt+Space', () => {
    console.log('Option+Space pressed - showing overlay');
    showOverlay();
  });

  // Register Escape to hide overlay
  const hideShortcut = globalShortcut.register('Escape', () => {
    console.log('Escape pressed - hiding overlay');
    hideOverlay();
  });

  if (!showShortcut) {
    console.log('Failed to register show shortcut');
  }
  
  if (!hideShortcut) {
    console.log('Failed to register hide shortcut');
  }
  
  if (showShortcut && hideShortcut) {
    console.log('Global shortcuts registered successfully');
  }
};

const showOverlay = (): void => {
  if (overlayWindow && !overlayWindow.isDestroyed() && !isOverlayVisible) {
    overlayWindow.show();
    isOverlayVisible = true;
    console.log('Overlay shown - press Escape to hide');
  }
};

const hideOverlay = (): void => {
  if (overlayWindow && !overlayWindow.isDestroyed() && isOverlayVisible) {
    overlayWindow.hide();
    isOverlayVisible = false;
    console.log('Overlay hidden');
  }
};

app.whenReady().then(createWindow);

app.on('before-quit', (event) => {
  console.log('App before-quit triggered');
  isQuitting = true;
  
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.destroy();
    overlayWindow = null;
  }
  
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.destroy();
    mainWindow = null;
  }
});

app.on('window-all-closed', () => {
  console.log('All windows closed');
  
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.destroy();
    overlayWindow = null;
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

process.on('SIGINT', () => {
  console.log('SIGINT received, force closing...');
  
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.destroy();
  }
  
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.destroy();
  }
  
  app.exit(0);
});
