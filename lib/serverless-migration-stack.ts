import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as stepfunctions from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';

export class ServerlessMigrationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const extractionLambda = new lambda.Function(this, "extractionLambda", {
      functionName: `${id}-extraction-lambda`,
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "extraction.handler",
      code: lambda.Code.fromAsset('src'),
      timeout: cdk.Duration.seconds(30),
    });

    const consolidationLambda = new lambda.Function(this, "consolidationLambda", {
      functionName: `${id}-consolidation-lambda`,
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "consolidation.handler",
      code: lambda.Code.fromAsset('src'),
      timeout: cdk.Duration.seconds(30),
    });

    const extractionTask = new tasks.LambdaInvoke(this, 'RunExtractionLambda', {
      lambdaFunction: extractionLambda,
      outputPath: '$.Payload',
    });

    const consolidationTask = new tasks.LambdaInvoke(this, 'RunConsolidationLambda', {
      lambdaFunction: consolidationLambda,
      outputPath: '$.Payload',
    });

    const definition = extractionTask.next(consolidationTask);

    const stateMachine = new stepfunctions.StateMachine(this, 'StateMachine', {
      definition,
    });

    // 7. CloudWatch Logs and Monitoring
    new cdk.CfnOutput(this, 'StateMachineArn', {
      value: stateMachine.stateMachineArn,
    });
  }
}
