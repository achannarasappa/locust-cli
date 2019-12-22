const { assert } = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const generateJobFile = require('./index');
const prompt = require('./prompt');

describe('generate', () => {

  it('writes a job file', async () => {

    const fsStub = sinon
      .stub(fs, 'writeFileSync');
    const promptStub = sinon
      .stub(prompt, 'promptJobDetails')
      .resolves({
        name: 'test-job',
        optionalHooks: [],
      });

    await generateJobFile();
    assert.ok(promptStub.calledOnce);
    assert.ok(fsStub.calledOnce);
    assert.ok(fsStub.calledWithMatch('./test-job.js', sinon.match.string));

    fsStub.restore();
    promptStub.restore();

  });

});
