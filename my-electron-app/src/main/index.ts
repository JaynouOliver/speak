import { app } from 'electron';
import { MainWindow } from './windows/MainWindow';
import { OverlayWindow } from './windows/OverlayWindow';
import { GlobalShortcuts } from './shortcuts/GlobalShortcuts';

if (require('electron-squirrel-startup')) {
  app.quit();
}

export class Application {
  private mainWindow: MainWindow;
  private overlayWindow: OverlayWindow;
  private shortcuts: GlobalShortcuts;
  private isQuitting = false;

  constructor() {
    this.mainWindow = new MainWindow();
    this.overlayWindow = new OverlayWindow();
    this.shortcuts = new GlobalShortcuts(this.overlayWindow);
  }

  async initialize(): Promise<void> {
    await app.whenReady();
    
    this.mainWindow.create();
    this.overlayWindow.create();
    this.shortcuts.register();
    
    this.setupAppEventHandlers();
  }

  private setupAppEventHandlers(): void {
    app.on('window-all-closed', () => {
      this.cleanup();
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('before-quit', () => {
      this.isQuitting = true;
      this.cleanup();
    });

    app.on('will-quit', () => {
      this.shortcuts.unregister();
    });

    app.on('activate', () => {
      if (!this.mainWindow.getWindow()) {
        this.mainWindow.create();
      }
    });
  }


  private cleanup(): void {
    this.overlayWindow.destroy();
    this.mainWindow.destroy();
  }
}

// Start the application
const application = new Application();
application.initialize().catch(console.error);
