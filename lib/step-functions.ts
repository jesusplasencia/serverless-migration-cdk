import * as stepfunctions from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface StepFunctionsStackProps extends cdk.StackProps {
  extractionLambda: lambda.Function;
  consolidationLambda: lambda.Function;
}

export class StepFunctionsStack extends cdk.Stack {
  public readonly stateMachine: stepfunctions.StateMachine;

  constructor(scope: Construct, id: string, props: StepFunctionsStackProps) {
    super(scope, id, props);

    // Define Step Functions tasks
    const extractionTask = new tasks.LambdaInvoke(this, 'RunExtractionLambda', {
      lambdaFunction: props.extractionLambda,
      outputPath: '$.Payload',
    });

    const consolidationTask = new tasks.LambdaInvoke(this, 'RunConsolidationLambda', {
      lambdaFunction: props.consolidationLambda,
      outputPath: '$.Payload',
    });

    // Define the state machine workflow
    const definition = extractionTask.next(consolidationTask);

    // Create the state machine
    this.stateMachine = new stepfunctions.StateMachine(this, `StateMachine`, {
      stateMachineName: `${id}-stateMachine`,
      definitionBody: stepfunctions.DefinitionBody.fromChainable(definition)
    });
  }
}