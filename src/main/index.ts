import { app, shell, BrowserWindow } from 'electron';
import { join } from 'node:path';
import { getDb, closeDb } from './db';
import { registerIpcHandlers } from './ipc/handlers';

const isDev = !app.isPackaged;

function createMainWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 1024,
    minHeight: 680,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#0b0f13',
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  const rendererUrl = process.env.ELECTRON_RENDERER_URL;
  if (isDev && rendererUrl) {
    mainWindow.loadURL(rendererUrl);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  // Inizializza il database SQLite locale (crea schema + seed se necessario) prima di
  // registrare i canali IPC che dipendono da esso.
  getDb();
  registerIpcHandlers();

  app.on('browser-window-created', (_event, window) => {
    window.webContents.on('before-input-event', (_e, input) => {
      if (input.key === 'F12') {
        window.webContents.toggleDevTools();
      }
    });
  });

  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    closeDb();
    app.quit();
  }
});

app.on('before-quit', () => {
  closeDb();
});
