const { terminal } = require('terminal-kit');

const stop = (term) => {

  setTimeout(() => {

    term.grabInput(false);
    term.clear();
    term.hideCursor(false);
    process.exit();

  }, 100);

};

const start = (onExit, term = terminal) => {

  term.windowTitle('locust - info');
  term.fullscreen(true);
  term.grabInput();
  term.hideCursor();

  term.on('key', async (name) => {

    if ([
      'CTRL_C',
      'q',
      'Q',
    ].includes(name)) {

      if (onExit)
        await onExit();
      return stop(term);

    }

  });

  return term;

};

module.exports = { start, stop };
