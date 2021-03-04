import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';
import * as s3n from '@aws-cdk/aws-s3-notifications';
import * as core from '@aws-cdk/core';

export interface S3StackProps extends core.StackProps {
  readonly Name: string;
  readonly LifecycleRules: s3.LifecycleRule[];
  readonly Grants: Grant[];
  readonly Lambdas: Lambda[];
  readonly Folders: string[];
}

interface Lambda {
  readonly Id: string;
  readonly LambdaFunctionArn: string;
  readonly Events: string[];
  readonly Filter: {
    Key: {
      FilterRule: {
        Name: FilterRulesName;
        Value: string;
      }[];
    };
  };
}

enum FilterRulesName {
  Prefix = 'Prefix',
  Suffix = 'Suffix',
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

    for (const lambdaEl in props.Lambdas) {

      const lambdaDef = props.Lambdas[lambdaEl];

      const lam = lambda.Function.fromFunctionArn(this, `Lambda${lambdaEl}`, lambdaDef.LambdaFunctionArn);
      // const dest = new s3not.LambdaDestination(lam);

      for (const eventType of lambdaDef.Events) {
        const prefixRules = lambdaDef.Filter.Key.FilterRule.filter(f => f.Name === FilterRulesName.Prefix);
        const suffixRules = lambdaDef.Filter.Key.FilterRule.filter(f => f.Name === FilterRulesName.Suffix);
        bucket.addEventNotification(s3.EventType[eventType], new s3n.LambdaDestination(lam), {
          prefix: prefixRules[0]?.Value,
          suffix: suffixRules[0]?.Value,
        });
      }

    }

    for (const folder of props.Folders) {
      if (folder.length === 0) {
        throw new Error('Empty folder name ist not valid');
      }
      new s3deploy.BucketDeployment(this, 'ArchivePrefixDeployment', {
        sources: [s3deploy.Source.asset('./empty_folder')],
        destinationBucket: bucket,
        destinationKeyPrefix: `${folder}/`,
      });
    }

  }
}