const { app, BrowserWindow, protocol } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;

// Importante: registrar o protocolo antes do app estar pronto
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } }
]);

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'frontend-apuama/public/Logo_APU.png'),
  });

  if (isDev) {
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    // Em produção, usa o protocolo customizado
    win.loadURL('app://./index.html');
    // win.webContents.openDevTools(); // Descomente para debugar se necessário
  }
}

app.whenReady().then(() => {
  // Registrar como lidar com o protocolo app://
  protocol.registerFileProtocol('app', (request, callback) => {
    const url = request.url.replace('app://', '');
    let decodedUrl = decodeURIComponent(url);
    
    // Remove query strings ou hashes
    decodedUrl = decodedUrl.split('?')[0].split('#')[0];

    let filePath = path.join(__dirname, 'frontend-apuama/out', decodedUrl);

    // Se a URL não tiver extensão, o Next.js quer um arquivo .html (amigável)
    if (!path.extname(filePath)) {
      filePath = path.join(filePath, 'index.html');
    }

    callback({ path: filePath });
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
