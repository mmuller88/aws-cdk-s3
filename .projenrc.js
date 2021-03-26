const { AwsCdkTypeScriptApp, NpmTaskExecution } = require('projen');

const deps = [];

const project = new AwsCdkTypeScriptApp({
  authorAddress: 'damadden88@googlemail.de',
  authorName: 'martin.mueller',
  cdkVersion: '1.91.0',
  cdkVersionPinning: true,
  defaultReleaseBranch: 'main',
  jsiiFqn: 'projen.AwsCdkTypeScriptApp',
  name: 'aws-cdk-s3',
  npmTaskExecution: NpmTaskExecution.SHELL,
  cdkDependencies: [
    '@aws-cdk/aws-s3',
    '@aws-cdk/aws-s3-deployment',
    '@aws-cdk/aws-s3-notifications',
    '@aws-cdk/aws-iam',
    '@aws-cdk/aws-lambda',
    '@aws-cdk/aws-sqs',
    '@aws-cdk/aws-sns',
    '@aws-cdk/aws-glue',
    '@aws-cdk/aws-sns-subscriptions',
  ],
  deps: deps,
  devDeps: deps,
  context: {
    '@aws-cdk/core:enableStackNameDuplicates': true,
    'aws-cdk:enableDiffNoFail': true,
    '@aws-cdk/core:stackRelativeExports': true,
    '@aws-cdk/core:newStyleStackSynthesis': true,
  },
  keywords: [
    'cdk',
    'aws',
    's3',
    'json',
  ],
  tsconfig: {
    compilerOptions: {
      noImplicitAny: false,
    },
  },
});

project.setScript('cdkDeploy', 'cdk deploy');
project.setScript('cdkDestroy', 'cdk destroy');
project.setScript('cdkSynth', 'cdk synth');

project.synth();
