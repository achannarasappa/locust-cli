const fs = require('fs');
const template = require('./job-template');
const prompt = require('./prompt');

const generateJobFile = async () => {

  const answers = await prompt.promptJobDetails();
  const jobFileContents = template(answers);

  fs.writeFileSync(`./${answers.name}.js`, jobFileContents);

};

module.exports = generateJobFile;
