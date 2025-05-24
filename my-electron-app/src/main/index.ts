import { app, BrowserWindow } from 'electron';
import { MainWindow } from './windows/MainWindow';
import { OverlayWindow } from './windows/OverlayWindow';
import { GlobalShortcuts } from './shortcuts/GlobalShortcuts';

// Handle Squirrel startup events
if (require('electron-squirrel-startup')) {
  app.quit();
}

/**
 * Application class - Singleton pattern
 * Manages the main application lifecycle and windows
 */
export class Application {
  // Private static instance for singleton pattern
  private static instance: Application | null = null;
  
  // Application components
  private mainWindow: MainWindow;
  private overlayWindow: OverlayWindow;
  private shortcuts: GlobalShortcuts;
  
  // State tracking
  private isQuitting = false;
  private isInitialized = false;

  /**
   * Get the singleton instance of the Application class
   */
  static getInstance(): Application {
    if (!Application.instance) {
      console.log('Creating new Application instance');
      Application.instance = new Application();
    }
    return Application.instance;
  }

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    console.log('Application constructor called');
    this.mainWindow = new MainWindow();
    this.overlayWindow = new OverlayWindow();
    this.shortcuts = new GlobalShortcuts(this.overlayWindow);
  }

  /**
   * Initialize the application
   * Creates windows and sets up event handlers
   */
  async initialize(): Promise<void> {
    // Prevent multiple initializations
    if (this.isInitialized) {
      console.log('Application already initialized - skipping');
      return;
    }

    // Ensure we're only running one instance of the app
    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
      console.log('Another instance is already running - quitting');
      app.quit();
      return;
    }

    console.log('Initializing application...');

    // Wait for app to be ready
    await app.whenReady();
    console.log('App is ready');
    
    // Create the main window and show it
    const mainWin = this.mainWindow.create();
    console.log(`Main window created: ${mainWin ? 'yes' : 'no'}`);
    
    // Create the overlay window but keep it hidden
    const overlayWin = this.overlayWindow.create();
    console.log(`Overlay window created: ${overlayWin ? 'yes' : 'no'}`);
    this.overlayWindow.hide(); // Ensure overlay is hidden on startup
    console.log('Overlay window hidden');
    
    // Register global shortcuts
    this.shortcuts.register();
    
    // Setup event handlers
    this.setupAppEventHandlers();
    
    // Mark as initialized
    this.isInitialized = true;
    
    console.log(`Application initialization complete`);
    
    // Log window count after a short delay for debugging
    setTimeout(() => {
      const windows = BrowserWindow.getAllWindows();
      console.log(`After initialization: ${windows.length} window(s) open`);
      windows.forEach((win, i) => {
        console.log(`Window ${i+1}: visible=${win.isVisible()}, focused=${win.isFocused()}, minimized=${win.isMinimized()}`);
      });
    }, 1000);
  }

  /**
   * Set up application event handlers
   */
  private setupAppEventHandlers(): void {
    app.on('window-all-closed', () => {
      // On macOS it is common for applications to stay open
      // until the user explicitly quits
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      // On macOS it's common to re-create a window when the dock icon is clicked
      if (this.mainWindow.getWindow() === null) {
        this.mainWindow.create();
      }
    });

    app.on('before-quit', () => {
      this.isQuitting = true;
    });

    // Additional cleanup when the app is about to quit
    app.on('will-quit', () => {
      this.cleanup();
    });
    
    // Handle second instance launch
    app.on('second-instance', () => {
      // Focus the main window if someone tried to open another instance
      const mainWin = this.mainWindow.getWindow();
      if (mainWin) {
        if (mainWin.isMinimized()) mainWin.restore();
        mainWin.focus();
      }
    });
  }

  /**
   * Clean up resources before application exit
   */
  private cleanup(): void {
    console.log('Cleaning up application resources...');
    this.shortcuts.unregister();
    this.mainWindow.destroy();
    this.overlayWindow.destroy();
  }
}

// The application is initialized from the main entry point (src/index.ts)
// No code execution at the module level to prevent duplicate initializations
