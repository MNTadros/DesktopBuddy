const { app, BrowserWindow, screen, ipcMain, Tray, Menu } = require('electron');
const path = require('path');
const activeWin = require('active-win');

let mainWindow;
let tray;
let currentPosition = 'bottom'; // bottom, left, right

function createWindow() {
  const display = screen.getPrimaryDisplay();
  const { width, height } = display.workAreaSize;

  mainWindow = new BrowserWindow({
    x: 0,
    y: height - 60,
    width: width,
    height: 60,
    frame: false,
    transparent: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile('renderer/index.html');

  // Don’t quit when window is closed, just hide
  mainWindow.on('close', (e) => {
    if (!app.isQuiting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  // Send active window title every second
  setInterval(async () => {
    const window = await activeWin();
    if (window) {
      mainWindow.webContents.send(
        'active-window',
        `${window.owner.name} - ${window.title}`
      );
    }
  }, 1000);
}

app.on('ready', () => {
  createWindow();

  // Setup tray
  tray = new Tray(path.join(__dirname, 'icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Desktop Buddy',
      click: () => {
        mainWindow.show();
      },
    },
    {
      label: 'Quit',
      click: () => {
        app.isQuiting = true;
        app.quit();
      },
    },
  ]);
  tray.setToolTip('Desktop Buddy');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });

  ipcMain.on('move-bar', () => {
    const display = screen.getPrimaryDisplay();
    const { width, height } = display.workAreaSize;

    if (currentPosition === 'bottom') {
      mainWindow.setBounds({ x: 0, y: 0, width: 60, height: height });
      currentPosition = 'left';
    } else if (currentPosition === 'left') {
      mainWindow.setBounds({ x: width - 60, y: 0, width: 60, height: height });
      currentPosition = 'right';
    } else {
      mainWindow.setBounds({ x: 0, y: height - 60, width: width, height: 60 });
      currentPosition = 'bottom';
    }

    // Notify renderer to rotate text/button
    mainWindow.webContents.send('bar-position', currentPosition);
  });
});

app.on('window-all-closed', (e) => {
});
