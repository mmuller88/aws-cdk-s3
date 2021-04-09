import { App } from '@aws-cdk/core';
// import { EventsStack } from './events-stack';
// import { GlueStack } from './glue-stack';
// import { LambdaStack } from './lambda-stack';
import { StepFunctionsStack } from './sqs-stack';
// import { SnsStack } from './sns-stack';
// import { S3Stack } from './s3-stack';
// import { SqsStack } from './sqs-stack';

const devEnv = {
  account: '981237193288',
  region: 'eu-central-1',
};

const app = new App();

// new S3Stack(app, 's3-stack-dev', {
//   env: devEnv,
//   // eslint-disable-next-line @typescript-eslint/no-require-imports
//   ...replaceJSON(require('./config/s3/config_tags.json')),
// });

// new SqsStack(app, 'sqs-stack-dev', {
//   env: devEnv,
//   // eslint-disable-next-line @typescript-eslint/no-require-imports
//   ...replacedJSON(require('./config/sqs/sqs-metadata.json')),
// });

// new SnsStack(app, 'sns-stack-dev', {
//   env: devEnv,
//   // eslint-disable-next-line @typescript-eslint/no-require-imports
//   ...replacedJSON(require('./config/sns/sns-metadata.json')),
// });

// new LambdaStack(app, 'lambda-stack-dev', {
//   env: devEnv,
//   // eslint-disable-next-line @typescript-eslint/no-require-imports
//   ...replacedJSON(require('./config/lambda/lambda-metadata.json')),
// });

// new EventsStack(app, 'events-stack-dev', {
//   env: devEnv,
//   // eslint-disable-next-line @typescript-eslint/no-require-imports
//   ...replacedJSON(require('./config/events/events-metadata.json')),
// });

// new GlueStack(app, 'glue-stack-dev', {
//   env: devEnv,
//   // eslint-disable-next-line @typescript-eslint/no-require-imports
//   ...replacedJSON(require('./config/glue/glue.json')),
// });

new StepFunctionsStack(app, 'stepfunctions-stack-dev', {
  env: devEnv,
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ...replacedJSON(require('./config/step-functions/step-functions-metadata.json')),
});

app.synth();

function replacedJSON(rawJSON) {
  return JSON.parse(JSON.stringify(rawJSON).replace(/\{0\}/g, app.node.tryGetContext('env') || ''));
}