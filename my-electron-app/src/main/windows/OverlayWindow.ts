import { BrowserWindow, screen } from 'electron';
import path from 'path';

export class OverlayWindow {
  private window: BrowserWindow | null = null;
  private isVisible = false;

  create(): BrowserWindow {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;

    this.window = new BrowserWindow({
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
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../../preload/overlay.js')
      }
    });

    this.window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    this.window.setAlwaysOnTop(true, 'screen-saver', 1);
    this.window.loadFile(path.join(__dirname, '../../src/renderer/overlay/index.html'));
    this.setupEventHandlers();
    
    return this.window;
  }

  private setupEventHandlers(): void {
    if (!this.window) return;

    this.window.on('closed', () => {
      this.window = null;
      this.isVisible = false;
    });
  }

  show(): void {
    if (this.window && !this.window.isDestroyed() && !this.isVisible) {
      this.window.show();
      this.isVisible = true;
      console.log('Overlay shown - press Escape to hide');
    }
  }

  hide(): void {
    if (this.window && !this.window.isDestroyed() && this.isVisible) {
      this.window.hide();
      this.isVisible = false;
      console.log('Overlay hidden');
    }
  }

  destroy(): void {
    if (this.window && !this.window.isDestroyed()) {
      this.window.destroy();
      this.window = null;
    }
  }

  getWindow(): BrowserWindow | null {
    return this.window;
  }
}
