// main.js
// electron main window (entrypoint)

const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");
// const isDev = import("electron-is-dev");
const isDev = false;
const { spawn } = require("child_process");
const execFile = require("child_process").execFile;
const app_instance = app.requestSingleInstanceLock();

let pythonExecutable;
let pythonProcess;

if (isDev) {
  pythonExecutable = "/opt/miniconda3/bin/python"; //Dev mode: load python from local
  console.log(`Using Python executable: ${pythonExecutable}`);
  pythonProcess = spawn(pythonExecutable, [
    path.join(__dirname, "../backend/backend.py"),
  ]);
} else {
  //pythonExecutable = path.join(__dirname, "../backend/dist/api", "api"); //Prod mode: load python bundle created with pyinstaller
  pythonExecutable = path.join(
    app.getAppPath(),
    "backend",
    "dist",
    "api",
    "api"
  ); // use when asar:false in electron-builder.config.json
  console.log(`Using Python executable: ${pythonExecutable}`);
  pythonProcess = spawn(pythonExecutable, []);
  // Log the stdout to the console
  pythonProcess.stdout.on("data", (data) => {
    console.log(`stdout: ${data.toString()}`);
  });

  // Log stderr (this will show any errors from the Python process)
  pythonProcess.stderr.on("data", (data) => {
    console.error(`stderr: ${data.toString()}`);
  });

  pythonProcess.on("close", (code) => {
    console.log(`Python process exited with code ${code}`);
  });
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.webContents.openDevTools();

  if (isDev) {
    mainWindow.loadURL("http://localhost:8080"); // Dev mode: Load React app from Webpack Dev Server
  } else {
    mainWindow.loadFile(
      path.join(app.getAppPath(), "frontend", "build", "index.html") // Prod mode: Load from production build
    );
  }

  // only one instance exists
  // change to focus if window is minimized
  if (!app_instance) {
    app.quit();
  } else {
    app.on("second-instance", (event, commandline, workingDirectory) => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
      }
    });
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// kill all child process before-quit
app.on("before-quit", () => {
  if (isDev) {
    if (pythonProcess) {
      console.log("Killing Python process...");
      pythonProcess.kill(); // Kill the Python process when quitting
    } else {
      console.log("Python process not running.");
    }
  } else {
    console.log("Killing Python process...");
    pythonProcess.kill();
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
  //   app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
