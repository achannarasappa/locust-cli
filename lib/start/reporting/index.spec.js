// const { assert } = require('chai');
const sinon = require('sinon');
// const termQueue = require('../term/summary/queue');
// const termSummary = require('../term/summary');
// const term = require('../term');
// const { start } = require('./reporting');

describe('reporting', () => {

  let clock;

  before(() => {

    clock = sinon.useFakeTimers();

  });

  after(() => {

    clock.restore();

  });

  describe('start', () => {

    it('starts a terminal session');

    it('renders the summary screen');

    it('refreshes the queue state on an interval');

  });

});

