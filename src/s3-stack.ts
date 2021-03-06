import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';
import * as s3n from '@aws-cdk/aws-s3-notifications';
import * as sns from '@aws-cdk/aws-sns';
import * as sqs from '@aws-cdk/aws-sqs';
import * as core from '@aws-cdk/core';

export interface S3StackProps extends core.StackProps {
  readonly Buckets: Bucket[];
}

interface Bucket {
  readonly Name: string;
  readonly LifeCycle?: LifeCycle[];
  readonly Grants?: Grant[];
  readonly Lambdas: Lambda[];
  readonly Queues: Queue[];
  readonly Topics: Topic[];
  readonly Folders?: string[];
  readonly Version: VersionedType;
};

enum VersionedType {
  Enabled = 'Enabled',
  Disabled = 'Disabled',
}

interface LifeCycle {
  readonly ID: string;
  readonly Status: string;
  readonly NoncurrentVersionExpiration: {
    NoncurrentDays: string;
  };
}

interface Topic extends NotificationTarget {
  readonly TopicArn: string;
}
interface Queue extends NotificationTarget {
  readonly QueueArn: string;
}

interface NotificationTarget {
  readonly Id: string;
  readonly Events: string[];
  readonly Filter: {
    Key: {
      FilterRules?: {
        Name: FilterRulesName;
        Value: string;
      }[];
    };
  };
}

interface Lambda extends NotificationTarget {
  readonly LambdaFunctionArn: string;
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

    // const topic = new sns.Topic(this, 'Topic');
    // const lambda2 = new lambda.Function(this, 'lambda', {
    //   runtime: lambda.Runtime.NODEJS_12_X,
    //   code: new lambda.InlineCode('foo'),
    //   handler: 'index.handler',
    // });
    // const queue = new sqs.Queue(this, 'Queue');

    for (const b of props.Buckets) {
      const bucket = new s3.Bucket(this, b.Name, {
        bucketName: b.Name,
        // removalPolicy: core.RemovalPolicy.DESTROY,
        // autoDeleteObjects: true,
        versioned: b.Version === VersionedType.Enabled,
        lifecycleRules: b.LifeCycle ? b.LifeCycle.map(lifecycle => ({
          id: lifecycle.ID,
          enabled: lifecycle.Status === 'Enabled' ? true : false,
          noncurrentVersionExpiration: core.Duration.days(Number.parseInt(lifecycle.NoncurrentVersionExpiration.NoncurrentDays)),
        })) : undefined,
      });

      // bucket.addToResourcePolicy(new iam.PolicyStatement({
      //   principals: [new iam.ServicePrincipal('s3.amazonaws.com')],
      //   actions: ['*'],
      //   resources: ['*'],
      // }));

      if (b.Grants) {
        for (const grant of b.Grants) {
          if (grant.Permission === Permission.FULL_CONTROL) {
            bucket.grantReadWrite(new iam.CanonicalUserPrincipal(grant.Grantee.ID));
          }
        }
      }

      for (const lambdaEl in b.Lambdas) {

        const lambdaDef = b.Lambdas[lambdaEl];

        const lam = lambda.Function.fromFunctionArn(this, `Lambda${lambdaEl}`, lambdaDef.LambdaFunctionArn);
        // lam.addToRolePolicy(new iam.PolicyStatement({
        //   principals: [new iam.ServicePrincipal('s3.amazonaws.com')],
        //   actions: ['lambda:InvokeFunction'],
        //   resources: [lam.functionArn],
        // }));

        // lam.addPermission('lambda-policy', {
        //   principal: new iam.ServicePrincipal('s3.amazonaws.com'),
        //   action: 'lambda:InvokeFunction',
        // });

        for (const eventType of lambdaDef.Events) {
          const prefixRules = lambdaDef.Filter.Key.FilterRules?.filter(f => f.Name === FilterRulesName.Prefix);
          const suffixRules = lambdaDef.Filter.Key.FilterRules?.filter(f => f.Name === FilterRulesName.Suffix);
          // console.log(`prefixRules=${prefixRules}`);
          // console.log(`suffixRules=${suffixRules}`);
          eventType;
          if (prefixRules && prefixRules[0].Value != '' || suffixRules && suffixRules[0].Value != '') {
            bucket.addEventNotification(eventType as s3.EventType, new s3n.LambdaDestination(lam), {
              prefix: prefixRules?.[0]?.Value,
              suffix: suffixRules?.[0]?.Value,
            });
          } else {
            bucket.addEventNotification(eventType as s3.EventType, new s3n.LambdaDestination(lam));
            // bucket.addObjectCreatedNotification(new s3n.LambdaDestination(lambda2));
          }
        }
      }

      for (const queueEl in b.Queues) {

        const queueDef = b.Queues[queueEl];

        const sq = sqs.Queue.fromQueueArn(this, `SQS${queueEl}`, queueDef.QueueArn);

        for (const eventType of queueDef.Events) {
          const prefixRules = queueDef.Filter.Key.FilterRules?.filter(f => f.Name === FilterRulesName.Prefix);
          const suffixRules = queueDef.Filter.Key.FilterRules?.filter(f => f.Name === FilterRulesName.Suffix);
          if (prefixRules && prefixRules[0].Value != '' || suffixRules && suffixRules[0].Value != '') {
            bucket.addEventNotification(eventType as s3.EventType, new s3n.SqsDestination(sq), {
              prefix: prefixRules?.[0]?.Value,
              suffix: suffixRules?.[0]?.Value,
            });
          } else {
            bucket.addEventNotification(eventType as s3.EventType, new s3n.SqsDestination(sq));
          }
        }
      }

      for (const snsEl in b.Topics) {

        const snsDef = b.Topics[snsEl];

        const sn = sns.Topic.fromTopicArn(this, `SNS${snsEl}`, snsDef.TopicArn);

        for (const eventType of snsDef.Events) {
          const prefixRules = snsDef.Filter.Key.FilterRules?.filter(f => f.Name === FilterRulesName.Prefix);
          const suffixRules = snsDef.Filter.Key.FilterRules?.filter(f => f.Name === FilterRulesName.Suffix);
          console.log(`prefixRules=${JSON.stringify(prefixRules)}`);
          console.log(`suffixRules=${JSON.stringify(suffixRules)}`);
          if (prefixRules && prefixRules[0].Value != '' || suffixRules && suffixRules[0].Value != '') {
            bucket.addEventNotification(eventType as s3.EventType, new s3n.SnsDestination(sn), {
              prefix: prefixRules?.[0]?.Value,
              suffix: suffixRules?.[0]?.Value,
            });
          } else {
            bucket.addEventNotification(eventType as s3.EventType, new s3n.SnsDestination(sn));
          }
        }
      }

      if (b.Folders) {
        for (const folder of b.Folders) {
          if (folder.length === 0) {
            break;
          }
          new s3deploy.BucketDeployment(this, `${b.Name}-${folder}`, {
            sources: [s3deploy.Source.asset('./src/empty_folder')],
            destinationBucket: bucket,
            destinationKeyPrefix: `${folder}/`,
          });
        }
      }
    }
  }
}