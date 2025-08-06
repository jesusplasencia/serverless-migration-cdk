import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface S3BucketStackProps extends cdk.StackProps {
  stage: string;
}

export class S3BucketStack extends cdk.Stack {
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: S3BucketStackProps) {
    super(scope, id, props);

    this.bucket = new s3.Bucket(this, 'serverlessMigrationBucket', {
      bucketName: `${id}-bucket`,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}