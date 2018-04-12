/*jshint esversion: 6 */

const electron = require('electron');
const app = require('electron').app;
const Menu = require('electron').Menu;
const url = require('url');
const path = require('path');

const { BrowserWindow, ipcMain } = electron;
let mainWindow;
let addWindow;

// Listen for app to ready
app.on('ready', function() {
    // Create new window
    mainWindow = new BrowserWindow({});
    // Load HTML in window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert Menu
    Menu.setApplicationMenu(mainMenu);

    // Quit app when closed
    mainWindow.on('closed', function() {
        app.quit();
    });

});

// Handle create add window
function createAddWindow() {
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add Shopping List Item'
    });
    // Load HTML in window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Garbage collection handle
    addWindow.on('closed', function() {
        addWindow = null;
    });
}

// Catch item:add

ipcMain.on('item:add', function(e, item) {
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});

// Create menu template
const mainMenuTemplate = [{
    label: 'File',
    submenu: [{
        label: 'Add Item',
        click() {
            createAddWindow();
        }
    }, {
        label: 'Clear Items',
        click() {
            mainWindow.webContents.send('item:clear');
        }
    }, {
        label: 'Quit',
        accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click() {
            app.quit();
        }
    }]
}];

// If mac, add empty object to menu
if (process.platform == 'dawrin') {
    mainMenuTemplate.unshift({});
}

// Add developer tools if not in production
if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [{
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}