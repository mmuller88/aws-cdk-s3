import * as sns from '@aws-cdk/aws-sns';
import * as subs from '@aws-cdk/aws-sns-subscriptions';
import * as core from '@aws-cdk/core';

export interface SnsStackProps extends core.StackProps {
  readonly Topics: Topic[];
}

interface Topic {
  readonly TopicName: string;
  readonly DisplayName: string;
  readonly Subscribers: string[];
  readonly Tags?: Tag[];
};

interface Tag {
  Key: string;
  Value: string;
}

export class SnsStack extends core.Stack {
  constructor(scope: core.Construct, id: string, props: SnsStackProps) {
    super(scope, id, props);

    for (const t of props.Topics) {
      const topic = new sns.Topic(this, t.TopicName, {
        topicName: t.TopicName,
      });

      for (const subscriber of t.Subscribers) {
        topic.addSubscription(new subs.EmailSubscription(subscriber));
      }

      if (t.Tags) {
        for (const tag of t.Tags) {
          core.Tags.of(topic).add(tag.Key, tag.Value);
        }
      }
    }
  }
}