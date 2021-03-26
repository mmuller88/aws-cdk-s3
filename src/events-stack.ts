import * as events from '@aws-cdk/aws-events';
import * as core from '@aws-cdk/core';

export interface EventsStackProps extends core.StackProps {
  readonly Events: Event[];
}

interface Event {
  readonly Name: string;
  readonly Arn: string;
  readonly EventPattern?: {
    source: string[];
    'detail-type': string[];
    detail?: {
      state: string[];
      jobName: JobName[];
    };
  };
  readonly State: string;
  readonly Description: string;
  readonly ScheduleExpression?: string;
  readonly EventBusName: string;
};

interface JobName {
  readonly prefix: string;
}

export class EventsStack extends core.Stack {
  constructor(scope: core.Construct, id: string, props: EventsStackProps) {
    super(scope, id, props);

    for (const event of props.Events) {
      new events.Rule(this, event.Name, {
        ruleName: event.Name,
        enabled: event.State === 'ENABLED' ? true : false,
        description: event.Description,
        eventBus: event.ScheduleExpression ? undefined : new events.EventBus(this, event.Name + 'EventBus'),
        eventPattern: {
          source: event.EventPattern?.source,
          detailType: event.EventPattern?.['detail-type'],
          detail: event.EventPattern?.detail,
        },
        schedule: event.ScheduleExpression ? events.Schedule.expression(event.ScheduleExpression) : undefined,
      });
    }
  }
}