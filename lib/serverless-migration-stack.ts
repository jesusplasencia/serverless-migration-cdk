import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as s3 from 'aws-cdk-lib/aws-s3';
import { S3BucketStack } from './buckets';
import { LambdaStack } from './lambdas';

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
		)

		new LambdaStack(
			scope,
			`${id}-lambda-stack`,
			{
				env: props.env,
				bucket: s3BucketStack.bucket,
				stage: stage
			}
		)

	}
}
