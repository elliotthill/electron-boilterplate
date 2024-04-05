const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const ipcMain = electron.ipcMain
const globalShortcut = electron.globalShortcut;
const debug = require('electron-debug');
const path = require('path')
const url = require('url')
const save_folder = 'saves';

const Store = require('electron-store');
const store = new Store();
const {gzip, ungzip} = require("node-gzip");
const fs = require("fs");

//We call this here as it utilizes command line switches for UI scaling
//It cannot be done after app is ready
let video_options = get_video_options();

let ENVIRONMENT = 'dev';

if (ENVIRONMENT === 'dev')
    debug();

let main_window

/*
 * Found some of these on SO
 *
 *
 */
app.commandLine.appendSwitch('enable-gpu-rasterization', 1)             //Turn on rasterization on mac
app.commandLine.appendSwitch('force-gpu-mem-available-mb', 2000)        //Does inrease GPU memory limit


function create_window() {

    const WEB_FOLDER = '';
    const PROTOCOL = 'file';

    electron.protocol.interceptFileProtocol(PROTOCOL, (request, callback) => {
        // // Strip protocol
        let url = request.url.substr(PROTOCOL.length + 1);

        // Build complete path for node require function
        url = path.join(__dirname, WEB_FOLDER, url);

        // Replace backslashes by forward slashes (windows)
        // url = url.replace(/\\/g, '/');
        url = path.normalize(url);

        /*console.log(request.url);
        console.log('==>');
        console.log(url);
        console.log("\n");*/

        callback({path: url});
    });





    // Create the browser window.
    main_window = new BrowserWindow({
        width: video_options.resolution_width,
        height: video_options.resolution_height,

        minWidth: 1920,
        minHeight: 1080,
        resizable: true,

        fullscreen: video_options.fullscreen,
        fullscreenable: true,

        title: 'Ultraspace',

        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            enableRemoteModule: true
        },
        frame: false,
        icon: 'favicon.ico'
        //titleBarStyle: 'hidden'
    });

    let index = "index.html";

    if (ENVIRONMENT === 'dev')
        index = 'index_dev.html';

    // and load the index.html of the app.
    main_window.loadURL(url.format({
        pathname: index,
        protocol: PROTOCOL + ':',
        slashes: true
    }));

    //reload on force refresh - dev only
    main_window.webContents.on('did-fail-load', () => main_window.loadURL(url.format({
        pathname: 'index.html',
        protocol: PROTOCOL + ':',
        slashes: true
    })));

    /*
     * Make save folder if not exists
     */
    let save_folder_dir = app.getPath('userData');
    save_folder_dir = path.join(save_folder_dir, save_folder)

    if (!fs.existsSync(save_folder_dir)){
        fs.mkdirSync(save_folder_dir);
    }

}



app.on('ready', () => {


    create_window();
})





/*
 * Electron Store key/value lookup for Config
 */
ipcMain.handle('get', (event, name) => {
    console.log(name);
    return store.get(name);
});
ipcMain.handle('set', (event, name, data) => {
    return store.set(name, data);
});

ipcMain.handle('delete', (event, name) => {
    return store.delete(name);
});




/*
 * File save load for individual save files
 */


ipcMain.handle('save', async (event, name, data) => {

    //This path will look like C:\Users\ellio\AppData\Roaming\Ultraspace
    let save_path = app.getPath('userData');
    save_path = path.join(save_path, save_folder);

    //Data is stringified json
    let file_path = path.join(save_path, name+".save");

    //Gzip compresses to make the file ~10x smaller
    let compressed = await gzip(data);
    return fs.writeFileSync(file_path, compressed);

});

ipcMain.handle('load', async (event, name) => {

    //This path will look like C:\Users\{username}\AppData\Roaming\Ultraspace
    //on windows
    let load_path = app.getPath('userData');
    load_path = path.join(load_path, save_folder);

    //Data is stringified json
    let file_path = path.join(load_path, name + ".save");
    console.log(file_path);

    let data = fs.readFileSync(file_path);

    let uncompressed = await ungzip(data);
    return uncompressed.toString();

});

ipcMain.handle('remove',  (event, name) => {

    let load_path = app.getPath('userData');
    load_path = path.join(load_path, save_folder);

    let file_path = path.join(load_path, name + ".save");
    console.log(file_path);
    return fs.unlinkSync(file_path)

});



//Close function
ipcMain.handle('close', (event) => {
    app.quit();
});


//Close function
ipcMain.handle('reload', (event) => {

    let video_options = get_video_options();

    main_window.setSize(video_options.resolution_width, video_options.resolution_height, true);
    main_window.setFullScreen(video_options.fullscreen);
});



/*
 * These are important for large resolutions like 4K
 *
 * The user should have a way of adjusting and enabling/disabling
 *
 * Device scale factor can be adjusted as a scaling factor
 *
 *
 */

function get_video_options() {

    //Get user options
    let user_options = store.get('options');


    //Option defaults
    let resolution_width = 1920;
    let resolution_height = 1080;
    let scaling = false;
    let fullscreen = false;


    try {

        if (user_options)
            user_options = JSON.parse(user_options);

        if (user_options.fullscreen === 'fullscreen') {
            fullscreen = true;
        }


        if (user_options.scaling === '100%') {

            app.commandLine.appendSwitch('high-dpi-support', 1)
            app.commandLine.appendSwitch('force-device-scale-factor', 1)
            console.log("Scaling mode set to 1x");
        }
        else if (user_options.scaling === '125%') {

            app.commandLine.appendSwitch('high-dpi-support', 1)
            app.commandLine.appendSwitch('force-device-scale-factor', 1.25)
            console.log("Scaling mode set to 1.25x");
        }
        else if (user_options.scaling === '150%') {

            app.commandLine.appendSwitch('high-dpi-support', 1)
            app.commandLine.appendSwitch('force-device-scale-factor', 1.5)
            console.log("Scaling mode set to 1.5x");
        }
        else if (user_options.scaling === '175%') {

            app.commandLine.appendSwitch('high-dpi-support', 1)
            app.commandLine.appendSwitch('force-device-scale-factor', 1.75)
            console.log("Scaling mode set to 1.75x");
        }
        else if (user_options.scaling === '200%') {

            app.commandLine.appendSwitch('high-dpi-support', 1)
            app.commandLine.appendSwitch('force-device-scale-factor', 2)
            console.log("Scaling mode set to 2x");
        }
        else if (user_options.resolution) {
            let [x, y] = user_options.resolution.split("x");
            resolution_width = parseInt(x);
            resolution_height = parseInt(y);
        }


    } catch(err) {
        console.log(err);
        console.log("No user options found")
    } finally {

        return {resolution_width: resolution_width, resolution_height:resolution_height, fullscreen:fullscreen};
    }

}




/*
 * Disable CMD+R Shift+R and F5 refresh
 */
if (ENVIRONMENT === 'dev')
    return;

app.on('browser-window-focus', function () {

    globalShortcut.register("CommandOrControl+R", () => {
        console.log("CommandOrControl+R is pressed: Shortcut Disabled");
    });

    globalShortcut.register("F5", () => {
        console.log("F5 is pressed: Shortcut Disabled");
    });
        globalShortcut.register("Shift+F5", () => {
        console.log("F5 is pressed: Shortcut Disabled");
    });
});

app.on('browser-window-blur', function () {
    globalShortcut.unregister('CommandOrControl+R');
    globalShortcut.unregister('F5');
    globalShortcut.unregister('Shift+F5');
});

