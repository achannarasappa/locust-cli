const { assert } = require('chai');
const sinon = require('sinon');
const locust = require('@achannarasappa/locust');
const jobDefinition = require('../../../test/job-definition');
const termQueue = require('../../term/summary/queue');
const termSummary = require('../../term/summary');
const term = require('../../term');
const reporting = require('./index');

describe('reporting', () => {

  let closeTerminal;

  describe('start', () => {

    let termStartStub;
    let termSummaryStub;
    let termQueueStub;
    let getSnapshotStub;

    before((done) => {

      termStartStub = sinon.stub(term, 'start').callsFake((cb) => {

        closeTerminal = cb;

        return sinon.fake();

      });
      termSummaryStub = sinon.stub(termSummary, 'render')
        .returns({
          summary: {
            updateMessage: sinon.fake(),
          },
          job: {
            update: sinon.fake(),
          },
        });
      termQueueStub = sinon.stub(termQueue, 'updateQueue');
      getSnapshotStub = sinon.stub(locust.queue, 'getSnapshot');

      reporting.start(sinon.fake(), sinon.fake(), jobDefinition, sinon.fake());

      setTimeout(async () => {

        await closeTerminal();
        done();

      }, 1500);

    });

    after(() => {

      sinon.restore();

    });

    it('starts a terminal session', () => {

      assert.ok(termStartStub.calledOnce);

    });

    it('renders the summary screen', () => {

      assert.ok(termSummaryStub.calledOnce);

    });

    it('refreshes the queue state on an interval', () => {

      assert.ok(getSnapshotStub.calledOnce);
      assert.ok(termQueueStub.calledOnce);

    });

  });

});

