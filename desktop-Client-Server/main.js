const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');
const {ipcMain} = require('electron');

//require('events').EventEmitter.defaultMaxListeners = Infinity;

// keep a Global reference of the window object. if you don't , the window will
// be closed automatically when the Javascript object is garbage collected.

let win;

var trueToken = null;





function createWindow() {

	// Create the browser window.

	win = new BrowserWindow({
                             minWidth: 1024,
														 minHeight: 600,
														 backgroundColor: '#ffffffff',
														 x: 0,
														 y: 0,
														 frame: true,
														 resizable: true,
														 icon: __dirname + '/media/icon/privy.png'
													 });
	win.setMenu(null);
	// and load the index.html of the app.

	win.loadURL(url.format({
		pathname: path.join(__dirname, 'index.html'),
		protocol: 'file:',
		slashes: true
	}));



	win.on('before-quit', () => {





	});



	// Open the DevTools.

	//win.webContents.openDevTools();

	// Emitted when the window is closed.
	win.on('close', () => {

				//console.log("closing....");
				trueToken = null;
				//console.log(trueToken);

	});




	win.on('closed', () => {


		win = null;
	});
}


// this method will be called when Electron has finished
// intialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.on('ready', createWindow);

// Quit when all windows are closed.

app.on('window-all-closed', () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (win === null) {
		createWindow();
	}
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in seperate files and require them here.


// this will bypass the certificate error ( self signed certificate problem ).

app.on('certificate-error', (event, webConents, url, error, certificate, callback) => {

		event.preventDefault();
		callback(true);



});

/*
ipcMain.on('asyc-msg', (event, arg) => {


			console.log(arg);
			event.sender.send('asyc-reply', 'pong');

});*/



ipcMain.on('token', (event, token) => {

		 trueToken = token;
		var destroyToken = false;


		console.log(trueToken);

		ipcMain.on('queryToken', (event) => {

				event.sender.send('queryTokenReply', trueToken);

		});

		ipcMain.on('signout', (event) => {

				  trueToken = null;
					//console.log(trueToken);


		});




});
