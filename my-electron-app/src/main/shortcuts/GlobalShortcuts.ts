import { globalShortcut } from 'electron';
import { OverlayWindow } from '../windows/OverlayWindow';

export class GlobalShortcuts {
  private overlayWindow: OverlayWindow;

  constructor(overlayWindow: OverlayWindow) {
    this.overlayWindow = overlayWindow;
  }

  register(): void {
    const showShortcut = globalShortcut.register('Alt+Space', () => {
      console.log('Option+Space pressed - showing overlay');
      this.overlayWindow.show();
    });

    const hideShortcut = globalShortcut.register('Escape', () => {
      console.log('Escape pressed - hiding overlay');
      this.overlayWindow.hide();
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
  }

  unregister(): void {
    globalShortcut.unregisterAll();
  } 
}
