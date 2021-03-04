import * as iam from '@aws-cdk/aws-iam';
import * as s3 from '@aws-cdk/aws-s3';
import * as core from '@aws-cdk/core';
// import { AppSyncTransformer } from 'cdk-appsync-transformer';


export interface S3StackProps extends core.StackProps {
  readonly name: string;
  readonly lifecycleRules: s3.LifecycleRule[];
}

export class S3Stack extends core.Stack {
  constructor(scope: core.Construct, id: string, props: S3StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'Bucket', {
      bucketName: props.name,
      removalPolicy: core.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: props.lifecycleRules,
    });

    bucket.grantReadWrite(new iam.CanonicalUserPrincipal('123'));
  }
}