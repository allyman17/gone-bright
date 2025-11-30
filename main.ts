import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as https from 'https';

let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  // const preloadPath = path.join(__dirname, 'preload.mjs');
  const preloadPath = path.join(__dirname, 'preload.cjs');  
  
  console.log('Preload path:', preloadPath);
  console.log('__dirname:', __dirname);
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#09090b',
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    titleBarStyle: 'default',
    autoHideMenuBar: true
  });

  if (isDev) {
    const port = process.env.VITE_DEV_SERVER_URL || 'http://localhost:3002';
    mainWindow.loadURL(port);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC handler for Hue API calls (bypasses CORS)
ipcMain.handle('hue:fetch', async (_event, url: string, options: any) => {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    
    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname,
      method: options.method || 'GET',
      headers: options.headers || {},
      rejectUnauthorized: false // Accept self-signed certs
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ ok: res.statusCode === 200, status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ ok: false, status: res.statusCode, data: null, error: 'Failed to parse JSON' });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
});

// Ignore certificate errors for local Hue Bridge (self-signed cert)
app.commandLine.appendSwitch('ignore-certificate-errors');

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
