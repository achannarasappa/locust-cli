/* eslint-disable newline-per-chained-call */
const { assert } = require('chai');
const sinon = require('sinon');
const inquirer = require('inquirer');
const { promptJobDetails } = require('./prompt');

describe('prompt', () => {

  let stub = sinon.stub();

  afterEach(() => {

    stub.restore();

  });

  describe('prompt', () => {

    context('the extract hook option is selected', () => {

      it('prompts the user to extract data', async () => {

        const expected = {
          extractFields: [
            {
              cssPath: 'title',
              label: 'title',
            },
          ],
          optionalHooks: ['extract'],
        };
        const output = () => promptJobDetails();

        stub = sinon.stub(inquirer, 'prompt')
          .onCall(0).resolves({
            optionalHooks: ['extract'],
          })
          .onCall(1).resolves({
            extract: 'yes',
          })
          .onCall(2).resolves({
            cssPath: 'title',
            label: 'title',
          })
          .onCall(3).resolves({
            extract: 'no',
          })
          .returns({});

        assert.deepEqual(await output(), expected);

      });

    });

    context('when the extract hook is not selected', () => {

      it('prompts the user to extract data', async () => {

        const expected = {
          optionalHooks: [],
        };
        const output = () => promptJobDetails();

        stub = sinon.stub(inquirer, 'prompt')
          .onCall(0).resolves({
            optionalHooks: [],
          })
          .returns({});

        assert.deepEqual(await output(), expected);

      });

    });

  });

});
