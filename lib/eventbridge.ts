import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface EventBridgeStackProps extends cdk.StackProps {
  extractionLambda: lambda.Function;
}

export class EventBridgeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: EventBridgeStackProps) {
    super(scope, id, props);

    new events.Rule(this, 'ScheduleRule', {
      schedule: events.Schedule.cron({ minute: '0', hour: '8-18' }),
      targets: [new targets.LambdaFunction(props.extractionLambda)],
    });
  }
}