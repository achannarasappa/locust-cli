const prettyjson = require('prettyjson');
const { validate } = require('@achannarasappa/locust');

const validateJobFile = async (filePath) => {

  // eslint-disable-next-line import/no-dynamic-require, global-require
  const jobDefinition = require(`${process.cwd()}/${filePath}`);

  try {

    await validate(jobDefinition);

    console.log('Job file is valid');

  } catch (e) {

    console.log(prettyjson.render(e.details));

  }

};

module.exports = validateJobFile;
