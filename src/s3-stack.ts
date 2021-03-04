import * as iam from '@aws-cdk/aws-iam';
import * as s3 from '@aws-cdk/aws-s3';
import * as core from '@aws-cdk/core';

export interface S3StackProps extends core.StackProps {
  readonly Name: string;
  readonly LifecycleRules: s3.LifecycleRule[];
  readonly Grants: Grant[];
}

interface Grant {
  readonly Grantee: {
    DisplayName: string;
    ID: string;
    Type: Type | string;
  };
  readonly Permission: Permission | string;
}

enum Type {
  CanonicalUser = 'CanonicalUser',
}

enum Permission {
  FULL_CONTROL = 'FULL_CONTROL',
}

export class S3Stack extends core.Stack {
  constructor(scope: core.Construct, id: string, props: S3StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'Bucket', {
      bucketName: props.Name,
      removalPolicy: core.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: props.LifecycleRules,
    });

    for (const grant of props.Grants) {
      if (grant.Permission === Permission.FULL_CONTROL) {
        bucket.grantReadWrite(new iam.CanonicalUserPrincipal(grant.Grantee.ID));
      }
    }
  }
}