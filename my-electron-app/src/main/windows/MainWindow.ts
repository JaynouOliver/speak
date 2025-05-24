import { BrowserWindow } from 'electron';
import path from 'path';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

export class MainWindow {
  private window: BrowserWindow | null = null;

  create(): BrowserWindow {
    this.window = new BrowserWindow({
      height: 600,
      width: 800,
      minWidth: 1000,
      minHeight: 600,
      webPreferences: {
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        nodeIntegration: false,
        contextIsolation: true
      },
    });

    this.window.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    this.setupEventHandlers();
    
    // Ensure dock is visible for main app on macOS
    if (process.platform === 'darwin' && require('electron').app.dock) {
      require('electron').app.dock.show();
    }
    
    return this.window;
  }

  private setupEventHandlers(): void {
    if (!this.window) return;

    this.window.on('closed', () => {
      this.window = null;
    });
  }

  getWindow(): BrowserWindow | null {
    return this.window;
  }

  destroy(): void {
    if (this.window && !this.window.isDestroyed()) {
      this.window.destroy();
      this.window = null;
    }
  }
}
