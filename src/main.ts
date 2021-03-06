import { App } from '@aws-cdk/core';
import { S3Stack, S3StackProps } from './s3-stack';

const devEnv = {
  account: '981237193288',
  region: 'eu-central-1',
};

const app = new App();

// eslint-disable-next-line @typescript-eslint/no-require-imports
const config: S3StackProps = require('./config/config_tags.json');

new S3Stack(app, 's3-stack-dev', {
  env: devEnv,
  ...config,
});

app.synth();