const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setHedgehogSpeed: (speed) => ipcRenderer.send('set-hedgehog-speed', speed),
  getHedgehogSpeed: () => ipcRenderer.invoke('get-hedgehog-speed'),
  onHedgehogSpeed: (callback) => ipcRenderer.on('hedgehog-speed-changed', (e, speed) => callback(speed)),
  onActiveWindow: (callback) => ipcRenderer.on('active-window', (event, data) => callback(data)),
  sendMoveBar: () => ipcRenderer.send('move-bar'),
  onBarPosition: (callback) => ipcRenderer.on('bar-position', (event, data) => callback(data)),
  closeSettingsWindow: () => ipcRenderer.send('close-settings-window'),
  settingsChanged: (settings) => ipcRenderer.send('settings-changed', settings),
  onSettingsChanged: (callback) => ipcRenderer.on('settings-changed', (event, settings) => callback(settings)),
});
