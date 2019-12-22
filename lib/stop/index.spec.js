const { assert } = require('chai');
const sinon = require('sinon');
const shell = require('shelljs');
const stop = require('./index');

describe('stop', () => {

  it('runs a shell command to start docker containers', async () => {

    const shellStub = sinon
      .stub(shell, 'exec')
      .returns(false);

    await stop();
    assert.ok(shellStub.calledOnce);
    assert.ok(shellStub.calledWithMatch(sinon.match(/^docker-compose (.*) down$/)));

    shellStub.restore();

  });

});
