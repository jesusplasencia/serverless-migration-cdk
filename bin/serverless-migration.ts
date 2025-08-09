#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ServerlessMigrationStack } from '../lib/serverless-migration-stack';

// Define stage-specific environment variables
const stageConfig: { [key: string]: { account: string; region: string } } = {
  dev: {
    account: process.env.DEV_ACCOUNT || '',
    region: process.env.DEV_REGION || 'us-east-1',
  },
  qa: {
    account: process.env.DEV_ACCOUNT || '',
    region: process.env.DEV_REGION || 'us-east-1',
  },
  prod: {
    account: process.env.PROD_ACCOUNT || '',
    region: process.env.PROD_REGION || 'us-east-1',
  },
};

// Create the CDK App
const app = new cdk.App();

// Extract stage from context
const stage = app.node.tryGetContext("stage") || "dev";

// Pass configuration values
new ServerlessMigrationStack(
  app,
  `serverless-migration`,
  {
    env: {
      account: stageConfig[stage].account,
      region: stageConfig[stage].region,
    },
    stage: stage,
  }
);