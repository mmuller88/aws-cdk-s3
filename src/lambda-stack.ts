import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import { S3EventSource } from '@aws-cdk/aws-lambda-event-sources';
import * as s3 from '@aws-cdk/aws-s3';
import * as sqs from '@aws-cdk/aws-sqs';
import * as core from '@aws-cdk/core';

export interface LambdaStackProps extends core.StackProps {
  readonly Lambdas: Lambda[];
}

interface Lambda {
  readonly Configuration: {
    readonly FunctionName: string;
    readonly Runtime: string;
    readonly Role: string;
    readonly Handler: string;
    readonly Timeout: number;
    readonly MemorySize: number;
    readonly Tags?: Tag[];
    readonly DeadLetterConfig?: {
      TargetArn: string;
    };
    readonly Events: {
      NotificationEvent: {
        Type: string;
        Properties: {
          Bucket: string;
          Events: s3.EventType;
        };
      };
    };
    readonly Environment: {
      Variables: {
        Topic: string;
        Subject: string;
        Vendor: string;
        Details: string;
        DEBUG: string;
      };
    };
    readonly Code: {
      S3Bucket: string;
      S3Key: string;
    };
  };
};

interface Tag {
  Key: string;
  Value: string;
}

export class LambdaStack extends core.Stack {
  constructor(scope: core.Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    for (const conf of props.Lambdas) {
      const l = conf.Configuration;
      const lam = new lambda.Function(this, l.FunctionName, {
        functionName: l.FunctionName,
        runtime: new lambda.Runtime(l.Runtime),
        code: lambda.Code.fromBucket(s3.Bucket.fromBucketName(this, l.Code.S3Bucket + l.FunctionName, l.Code.S3Bucket), l.Code.S3Key),
        handler: l.Handler,
        timeout: core.Duration.seconds(l.Timeout),
        memorySize: l.MemorySize,
        deadLetterQueue: l.DeadLetterConfig ? sqs.Queue.fromQueueArn(this, l.FunctionName + 'deadletterqueue', l.DeadLetterConfig.TargetArn) : undefined,
        role: new iam.Role(this, l.FunctionName + 'Role', {
          roleName: l.Role,
          assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
          managedPolicies: [
            iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
            iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole'),
          ],
        }),
        environment: {
          // NOTIFICATION: l.Environment.Variables.NOTIFICATION,
        },
      });

      // eslint-disable-next-line max-len
      // const eventSourceBucket = s3.Bucket.fromBucketArn(this, l.Events.NotificationEvent.Properties.Bucket, l.Events.NotificationEvent.Properties.Bucket);

      const eventSourceBucket = new s3.Bucket(this, 'eventSourceBucket' + l.FunctionName, {
        removalPolicy: core.RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
      });

      // eslint-disable-next-line max-len
      lam.addEventSource(new S3EventSource(eventSourceBucket, {
        events: [l.Events.NotificationEvent.Properties.Events],
      }));

      // .fromBucketArn(this, l.Events.NotificationEvent.Properties.Bucket, l.Events.NotificationEvent.Properties.Bucket), {
      //   events: [l.Events.NotificationEvent.Properties.Events],
      // }));


      if (l.Tags) {
        for (const tag of l.Tags) {
          core.Tags.of(lam).add(tag.Key, tag.Value);
        }
      }
    }
  }
}