import { App } from '@aws-cdk/core';
import { S3Stack, S3StackProps } from './s3-stack';

const devEnv = {
  account: '981237193288',
  region: 'eu-central-1',
};

const app = new App();

// eslint-disable-next-line @typescript-eslint/no-require-imports
const rawJSON = require('./config/config_tags.json');
// CDK SYNTH -c env=sit, then the topic name "awshub-{0}-processing" should be replaced with "awshub-sit-processing".
// console.log(`env=${app.node.tryGetContext('env')}`);
const replacedJSON = JSON.parse(JSON.stringify(rawJSON).replace('{0}', app.node.tryGetContext('env') || ''));
const config: S3StackProps = replacedJSON;

new S3Stack(app, 's3-stack-dev', {
  env: devEnv,
  ...config,
});

app.synth();