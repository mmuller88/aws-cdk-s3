import * as sf from '@aws-cdk/aws-stepfunctions';
import * as iam from '@aws-cdk/aws-iam';
import * as core from '@aws-cdk/core';

export interface StepFunctionsStackProps extends core.StackProps {
  readonly StepFunctions: StepFunction[];
}

interface StepFunction {
  readonly Configuration: {
    readonly stateMachineArn: string;
    readonly status: string;
    readonly stateMachineName: string;
    stateMachineType: string;
    definition: any;
  };
};

// interface Tag {
//   Key: string;
//   Value: string;
// }

/**
 * CDK doesn't support the definition as a JSON directly https://github.com/aws/aws-cdk/issues/8146
 */
export class StepFunctionsStack extends core.Stack {
  constructor(scope: core.Construct, id: string, props: StepFunctionsStackProps) {
    super(scope, id, props);

    for (const s of props.StepFunctions) {
      const statemachine = new sf.StateMachine(this, s.Configuration.stateMachineName, {
        definition: new sf.Pass(this, 'StartState'),
        role: iam.Role.fromRoleArn(this, `${s.Configuration.stateMachineName}-arn`, s.Configuration.stateMachineArn),
        stateMachineType: s.Configuration.stateMachineType as sf.StateMachineType,
      });

      const cfnStatemachine = statemachine.node.defaultChild as sf.CfnStateMachine;

      cfnStatemachine.definitionString = JSON.stringify(s.Configuration.definition);

      // if (s.Tags) {
      //   for (const tag of s.Tags) {
      //     core.Tags.of(queue).add(tag.Key, tag.Value);
      //   }
      // }
    }
  }
}