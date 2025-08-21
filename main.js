const { app, BrowserWindow, screen, ipcMain, Tray, Menu } = require('electron');
const path = require('path');
const activeWin = require('active-win');

let mainWindow;
let tray;
let currentPosition = 'bottom';
let hedgehogSpeed = 3;
app.isQuiting = false;

// Window management
function createMainWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    x: 0,
    y: height - 60,
    width,
    height: 60,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile('renderer/index.html');

  mainWindow.on('close', handleWindowClose);
  startActiveWindowTracking();
}

function openSettingsWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  const settingsWindow = new BrowserWindow({
    width: 800,
    height: 650,
    resizable: false,
    minimizable: false,
    maximizable: false,
    alwaysOnTop: true,
    frame: false,
    modal: true,
    parent: mainWindow,
    x: Math.floor(width / 2 - 400),
    y: Math.floor(height / 2 - 325),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  settingsWindow.loadFile('renderer/settings.html');
  settingsWindow.once('ready-to-show', () => settingsWindow.show());
}

// Event handlers
function handleWindowClose(event) {
  if (!app.isQuiting) {
    event.preventDefault();
    mainWindow.hide();
  }
}

function startActiveWindowTracking() {
  setInterval(async () => {
    try {
      const window = await activeWin();
      if (window) {
        const processName = window.owner?.name || "Unknown";
        const windowTitle = window.title || "";
        mainWindow.webContents.send('active-window', `${processName} - ${windowTitle}`);
      }
    } catch (error) {
      console.error('Error tracking active window:', error);
    }
  }, 1000); // TODO: Change from a 1 second interval
}

// Tray management
function setupTray() {
  tray = new Tray(path.join(__dirname, 'icon.png'));
  
  const contextMenu = createTrayContextMenu();
  tray.setToolTip('Desktop Buddy');
  tray.setContextMenu(contextMenu);

  tray.on('click', handleTrayClick);
  tray.on('middle-click', handleTrayMiddleClick);
}

function createTrayContextMenu() {
  return Menu.buildFromTemplate([
    { 
      label: 'Show Desktop Buddy', 
      click: () => mainWindow.show() 
    },
    { 
      label: 'Hide Desktop Buddy', 
      click: () => mainWindow.hide() 
    },
    { type: 'separator' },
    { 
      label: 'Settings', 
      click: openSettingsWindow 
    },
    { type: 'separator' },
    { 
      label: 'Quit', 
      click: () => { 
        app.isQuiting = true; 
        app.quit(); 
      } 
    },
  ]);
}

function handleTrayClick() {
  mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
}

function handleTrayMiddleClick() {
  app.isQuiting = true;
  app.quit();
}

// Bar positioning
function moveBar() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const positions = {
    bottom: { x: 0, y: height - 60, width, height: 60 },
    left: { x: 0, y: 0, width: 60, height },
    right: { x: width - 60, y: 0, width: 60, height }
  };

  currentPosition = getNextPosition(currentPosition);
  mainWindow.setBounds(positions[currentPosition]);
  mainWindow.webContents.send('bar-position', currentPosition);
}

function getNextPosition(current) {
  const positions = ['bottom', 'left', 'right'];
  const currentIndex = positions.indexOf(current);
  return positions[(currentIndex + 1) % positions.length];
}

// IPC Handlers
function setupIpcHandlers() {
  
  // Settings management
  ipcMain.on('settings-changed', handleSettingsChanged);
  ipcMain.on('close-settings-window', closeSettingsWindow);
  
  // Bar control
  ipcMain.on('move-bar', moveBar);
  
  // Hedgehog speed control
  ipcMain.handle('get-hedgehog-speed', getHedgehogSpeed);
  ipcMain.on('set-hedgehog-speed', setHedgehogSpeed);
}

function handleSettingsChanged(event, newSettings) {
  mainWindow?.webContents.send('settings-changed', newSettings);
}

function closeSettingsWindow() {
  const settingsWindow = BrowserWindow.getAllWindows()
    .find(w => w.getTitle() === 'Settings');
  settingsWindow?.close();
}

function getHedgehogSpeed() {
  return hedgehogSpeed;
}

function setHedgehogSpeed(event, speed) {
  hedgehogSpeed = Number(speed) || 3;
  mainWindow?.webContents.send('hedgehog-speed-changed', hedgehogSpeed);
}

// App lifecycle
function initializeApp() {
  createMainWindow();
  setupTray();
  setupIpcHandlers();
}

function preventAppQuit(event) {
  event.preventDefault();
}

// Event registration
app.on('ready', initializeApp);
app.on('window-all-closed', preventAppQuit);