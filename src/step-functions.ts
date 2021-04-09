import * as sqs from '@aws-cdk/aws-sqs';
import * as core from '@aws-cdk/core';

export interface SqsStackProps extends core.StackProps {
  readonly Queues: Queue[];
}

interface Queue {
  readonly QueueName: string;
  readonly DisplayName: string;
  readonly DelaySeconds: string;
  readonly MessageRetentionPeriod: string;
  readonly VisibilityTimeout: string;
  readonly Tags?: Tag[];
};

interface Tag {
  Key: string;
  Value: string;
}

export class SqsStack extends core.Stack {
  constructor(scope: core.Construct, id: string, props: SqsStackProps) {
    super(scope, id, props);

    for (const q of props.Queues) {
      const queue = new sqs.Queue(this, q.QueueName, {
        queueName: q.QueueName,
        deliveryDelay: core.Duration.seconds(Number.parseInt(q.DelaySeconds)),
        retentionPeriod: core.Duration.minutes(Number.parseInt(q.MessageRetentionPeriod)),
        visibilityTimeout: core.Duration.seconds(Number.parseInt(q.VisibilityTimeout)),
      });

      if (q.Tags) {
        for (const tag of q.Tags) {
          core.Tags.of(queue).add(tag.Key, tag.Value);
        }
      }
    }
  }
}