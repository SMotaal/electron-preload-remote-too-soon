typeof window === 'object' ? preload() : main();

function main() {
  const { app, BrowserWindow } = require('electron');
  const { resolve: absolute } = require('path');

  let browserWindow;

  browserWindow || createWindow();

  function createWindow() {
    if (browserWindow) return;
    if (!app.isReady()) return app.on('ready', createWindow);

    const preload = absolute(__filename);
    browserWindow = new BrowserWindow({ webPreferences: { preload } });

    const filename = absolute(__dirname, 'index.html');
    browserWindow.loadURL(`data:text/html,${`
  preloaded: <script>document.write(this.preloaded)</script><br/>
  remote-early: <script>document.write(this['remote-early'])</script><br/>
  remote-late: <script>document.write(this['remote-late'])</script><br/>
  <br/>
  <b>Reload the window to test for issue (but disconnect devtools first).</b>
  `.replace(/\n/g, '').trim()}`);
    browserWindow.once('closed', () => { browserWindow = null });
  }
}

function preload() {
  const { remote: { app }, remote } = require('electron');

  try {
    window['remote-early'] = app.getAppPath() && true;
  } catch (exception) {
    window['remote-early'] = false;
  }

  try {
    window['remote-late'] = remote.app.getAppPath() && true;
  } catch (exception) {
    window['remote-late'] = false;
  }

  // Proves issue is in constructing remote "app" object itself
  if (!window['remote-early']) {
    try {
      window['remote-early'] = app.getAppPath() && true;
    } catch (exception) {
      window['remote-early'] = false;
    }
  }

  window.preloaded = true;
}
