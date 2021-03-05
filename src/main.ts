import { App, Construct, Stack, StackProps } from '@aws-cdk/core';
import { S3Stack, S3StackProps } from './s3-stack';

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

  }
}

const devEnv = {
  account: '981237193288',
  region: 'eu-central-1',
};

const app = new App();

// eslint-disable-next-line @typescript-eslint/no-require-imports
const config: S3StackProps = require('./config/config_lambda.json');

new S3Stack(app, 's3-stack-dev', {
  env: devEnv,
  ...config,
});

app.synth();