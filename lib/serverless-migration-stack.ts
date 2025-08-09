import * as cdk from 'aws-cdk-lib';

import * as s3 from 'aws-cdk-lib/aws-s3';

import * as lambda from 'aws-cdk-lib/aws-lambda';

import * as stepfunctions from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';

import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';

import { Construct } from 'constructs';

interface ServerlessMigrationStackProps extends cdk.StackProps {
	stage: string;
}

export class ServerlessMigrationStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props: ServerlessMigrationStackProps) {
		super(scope, id, props);

		const { stage } = props;

		const bucketMigration = new s3.Bucket(this, 'serverlessMigrationBucket', {
			bucketName: `${id}-${stage}-bucket`,
			versioned: false,
			encryption: s3.BucketEncryption.S3_MANAGED,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
		});


		const extractionLambda = new lambda.Function(this, "extractionLambda", {
			functionName: `${id}-${stage}-extractionLambda`,
			runtime: lambda.Runtime.NODEJS_22_X,
			handler: "extraction.handler",
			code: lambda.Code.fromAsset('src'),
			timeout: cdk.Duration.seconds(30),
			environment: {
				BUCKET_NAME: bucketMigration.bucketName,
				STAGE: stage
			}
		});

		// Grant S3 permissions to the Extraction Lambda
		bucketMigration.grantReadWrite(extractionLambda);

		// Consolidation Lambda
		const consolidationLambda = new lambda.Function(this, 'consolidationLambda', {
			functionName: `${id}-${stage}-consolidationLambda`,
			runtime: lambda.Runtime.NODEJS_22_X,
			handler: 'consolidation.handler',
			code: lambda.Code.fromAsset('src'),
			timeout: cdk.Duration.seconds(30),
			environment: {
				STAGE: props.stage,
				BUCKET_NAME: bucketMigration.bucketName
			}
		});

		// Grant S3 permissions to the Consolidation Lambda
		bucketMigration.grantRead(consolidationLambda);


		// Create Step Functions State Machine
		const extractionTask = new tasks.LambdaInvoke(this, 'RunExtractionLambda', {
			lambdaFunction: extractionLambda,
			outputPath: '$.Payload',
		});

		const consolidationTask = new tasks.LambdaInvoke(this, 'RunConsolidationLambda', {
			lambdaFunction: consolidationLambda,
			outputPath: '$.Payload',
		});

		// Define the state machine workflow
		const definition = extractionTask.next(consolidationTask);

		// Create the state machine
		const stateMachine = new stepfunctions.StateMachine(this, `StateMachine`, {
			stateMachineName: `${id}-${stage}-stateMachine`,
			definitionBody: stepfunctions.DefinitionBody.fromChainable(definition)
		});

		// Create EventBridge Rule
		new events.Rule(this, 'ScheduleRule', {
			schedule: events.Schedule.cron({ minute: '0', hour: '8-18' }),
			targets: [new targets.LambdaFunction(extractionLambda)],
		});

		// Output the State Machine ARN
		new cdk.CfnOutput(this, 'StateMachineArn', {
			value: stateMachine.stateMachineArn,
		});

	}
}
