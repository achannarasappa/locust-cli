const { terminal } = require('terminal-kit');

const stop = (term) => {

  term.grabInput(false);
  setTimeout(() => {

    term.clear();
    term.hideCursor(false);
    process.exit();

  }, 100);

};

const renderMenu = (term) => {

  const MENU_ITEMS = [
    'Summary',
    'Queue',
    'Log',
    'Exit',
  ];

  const options = {
    y: 1,
    style: term.inverse,
    selectedStyle: term.dim.blue.bgBlue,
  };

  term.singleLineMenu(MENU_ITEMS, options, (error, response) => {

    if (response.selectedText === 'Exit')
      stop(term);

  });

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

    if (['m', 'M'].includes(name))
      return renderMenu(term);

  });

  return term;

};

module.exports = { start, stop };
