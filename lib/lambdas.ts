import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface LambdaStackProps extends cdk.StackProps {
	bucket: s3.Bucket;
	stage: string;
}

export class LambdaStack extends cdk.Stack {

	public readonly extractionLambda: lambda.Function;
	public readonly consolidationLambda: lambda.Function;

	constructor(scope: Construct, id: string, props: LambdaStackProps) {
		super(scope, id, props);

		// Extraction Lambda
		this.extractionLambda = new lambda.Function(this, "extractionLambda", {
			functionName: `${id}-extractionLambda`,
			runtime: lambda.Runtime.NODEJS_22_X,
			handler: "extraction.handler",
			code: lambda.Code.fromAsset('src'),
			timeout: cdk.Duration.seconds(30),
			environment: {
				BUCKET_NAME: props.bucket.bucketName,
				STAGE: props.stage
			}
		});

		// Grant S3 permissions to the Extraction Lambda
		props.bucket.grantReadWrite(this.extractionLambda);

		// Consolidation Lambda
		this.consolidationLambda = new lambda.Function(this, 'consolidationLambda', {
			functionName: `${id}-consolidationLambda`,
			runtime: lambda.Runtime.NODEJS_22_X,
			handler: 'consolidation.handler',
			code: lambda.Code.fromAsset('src'),
			timeout: cdk.Duration.seconds(30),
			environment: {
				STAGE: props.stage,
				BUCKET_NAME: props.bucket.bucketName
			}
		});

		// Grant S3 permissions to the Consolidation Lambda
		props.bucket.grantRead(this.consolidationLambda);
	}

}