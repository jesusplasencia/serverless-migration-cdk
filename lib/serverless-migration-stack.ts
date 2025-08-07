import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { S3BucketStack } from './buckets';
import { LambdaStack } from './lambdas';
import { StepFunctionsStack } from './step-functions';
import { EventBridgeStack } from './eventbridge';

interface ServerlessMigrationStackProps extends cdk.StackProps {
	stage: string;
}

export class ServerlessMigrationStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props: ServerlessMigrationStackProps) {
		super(scope, id, props);

		const stage = props.stage;

		const s3BucketStack = new S3BucketStack(
			scope,
			`${id}-s3-stack`,
			{
				env: props.env,
				stage
			}
		);

		const lambdaStack = new LambdaStack(
			scope,
			`${id}-lambda-stack`,
			{
				env: props.env,
				bucket: s3BucketStack.bucket,
				stage: stage
			}
		);

		// Create Step Functions State Machine
		const stepFunctionsStack = new StepFunctionsStack(
			scope,
			`${id}-step-functions-stack`,
			{
				extractionLambda: lambdaStack.extractionLambda,
				consolidationLambda: lambdaStack.consolidationLambda,
			}
		);

		// Create EventBridge Rule
		new EventBridgeStack(
			scope,
			`${id}-event-bridge-stack`,
			{
				extractionLambda: lambdaStack.extractionLambda,
			}
		);

		// Output the State Machine ARN
		new cdk.CfnOutput(this, 'StateMachineArn', {
			value: stepFunctionsStack.stateMachine.stateMachineArn,
		});

	}
}
