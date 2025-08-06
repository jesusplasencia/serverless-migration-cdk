#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ServerlessMigrationStack } from '../lib/serverless-migration-stack';

// Define stage-specific environment variables
const stageConfig: { [key: string]: { account: string; region: string } } = {
  dev: {
    account: process.env.DEV_ACCOUNT_ID || '',
    region: process.env.DEV_REGION || 'us-east-1',
  },
  qa: {
    account: process.env.DEV_ACCOUNT_ID || '',
    region: process.env.DEV_REGION || 'us-east-1',
  },
  prod: {
    account: process.env.PROD_ACCOUNT_ID || '',
    region: process.env.PROD_REGION || 'us-east-1',
  },
};

// Parse the --stage argument
const args = process.argv.slice(2);
const stageArg = args.find(arg => arg.startsWith('--stage='));
const stage = stageArg ? stageArg.split('=')[1] : 'dev'; // Default to 'dev' if no stage is provided

if (!stageConfig[stage]) {
  throw new Error(`Invalid stage: ${stage}. Valid stages are: ${Object.keys(stageConfig).join(', ')}`);
}

if (!stageConfig[stage].account || !stageConfig[stage].region) {
  throw new Error(`Missing environment variables for stage: ${stage}`);
}

// Create the CDK App
const app = new cdk.App();

// Pass configuration values
new ServerlessMigrationStack(
  app,
  `serverless-migration-${stage}`,
  {
    env: {
      account: stageConfig[stage].account,
      region: stageConfig[stage].region,
    },
    stage: stage,
  }
);