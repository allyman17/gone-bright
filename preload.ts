import { contextBridge, ipcRenderer } from 'electron';

console.log('Preload script is running!');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  },
  hue: {
    fetch: (url: string, options: any) => ipcRenderer.invoke('hue:fetch', url, options)
  }
});

console.log('Preload script completed, window.electron should be available');
