const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onActiveWindow: (callback) => ipcRenderer.on('active-window', (event, data) => callback(data)),
  sendMoveBar: () => ipcRenderer.send('move-bar'),
  onBarPosition: (callback) => ipcRenderer.on('bar-position', (event, data) => callback(data))
});
