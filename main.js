"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = require("path");
var isDev = process.env.NODE_ENV !== 'production';
function createWindow() {
    var mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 1200,
        minHeight: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    var startUrl = isDev
        ? 'http://localhost:3000'
        : "file://".concat(path.join(__dirname, 'src/build/index.html'));
    mainWindow.loadURL(startUrl);
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }
}
electron_1.app.whenReady().then(createWindow);
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', function () {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
