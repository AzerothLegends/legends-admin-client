const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const axios = require('axios'); 
function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 768,
        maximizable: false, 
        title: "Legends Admin", 
        autoHideMenuBar: true, 
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),  
            sandbox: true,  
            webSecurity: true, 
            allowRunningInsecureContent: false
        }
    });
    const url = 'http://127.0.0.1/mobileapp';
    axios.get(url)
        .then(response => {
            console.log('Site está disponível. Carregando URL...');
            win.loadURL(url);
        })
        .catch(error => {
            console.log('Erro ao tentar acessar o site:', error.message);
            win.loadFile(path.join(__dirname, 'src/404.html'));
        });
    win.webContents.on('did-fail-load', () => {
        console.log('Falha ao carregar a URL. Carregando a página 404...');
        win.loadFile(path.join(__dirname, 'src/404.html'));
    });
        win.on('resize', () => {
            win.setBounds({
                x: win.getBounds().x,
                y: win.getBounds().y,
                width: 1280,
                height: 768
            });
        }); 
    win.webContents.on('new-window', (event, url) => {
        event.preventDefault(); 
        console.log('Tentativa de abrir uma nova janela:', url);
    });
    win.webContents.on('will-navigate', (event, url) => {
        if (url.startsWith('http://127.0.0.1/mobileapp')) {
            console.log('Navegação interna permitida para:', url);
        } else {
            console.log('Bloqueando navegação externa para:', url);
            event.preventDefault();
        }
    });
    win.webContents.on('will-redirect', (event, url) => {
        if (url.startsWith('http://127.0.0.1/mobileapp')) {
            console.log('Redirecionamento interno permitido para:', url);
        } else {
            console.log('Bloqueando redirecionamento externo para:', url);
            event.preventDefault();
        }
    });
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http://127.0.0.1/mobileapp')) {
            console.log('Tentativa de abrir URL interna:', url);
            return { action: 'allow' };
        }
        console.log('Tentativa de abrir URL externa:', url);
        return { action: 'deny' };
    });
    win.webContents.on('did-navigate', (event, url) => {
        console.log('Navegando para:', url);
    });
    win.webContents.on('did-get-title', () => {
        win.setTitle("Legends Admin");
    });
    win.webContents.on('page-title-updated', (event, title) => {
        event.preventDefault(); 
    });
    win.on('ready-to-show', () => {
        win.setTitle("Legends Admin");
    });
    
    win.webContents.on('did-finish-load', () => {
        win.setTitle("Legends Admin");
    });      
}
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
