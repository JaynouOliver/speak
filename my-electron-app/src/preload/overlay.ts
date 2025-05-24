// Preload script for the overlay window
import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('overlay', {
  // You can expose specific methods as needed
});
