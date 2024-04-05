const { contextBridge , ipcRenderer} = require('electron')

/*
 * This file sets up the IPC bridges
 */
contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
});

/*
 * Electron Store get/set
 */
contextBridge.exposeInMainWorld('store', {
    get: (name) => ipcRenderer.invoke('get', name),
    set: (name, data) => ipcRenderer.invoke('set', name, data),
    delete: (name) => ipcRenderer.invoke('delete', name),
});

/*
 * Save and Load file
 */
contextBridge.exposeInMainWorld('file', {
    save: (name, data) => ipcRenderer.invoke('save', name, data),
    load: (name ) => ipcRenderer.invoke('load', name),
    remove: (name ) => ipcRenderer.invoke('remove', name),
});

/*
 * Electron close function
 */
contextBridge.exposeInMainWorld('electron', {
    close: (name) => ipcRenderer.invoke('close'),
    reload: (name) => ipcRenderer.invoke('reload')
});
