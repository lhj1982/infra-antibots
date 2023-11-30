#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { WebbInfraStack } from '../lib/webb-infra-stack';
import { WebbFrontendInfraStack } from '../lib/webb-frontend-infra-stack';

const app = new cdk.App();
const devEnv = {
    account: '439314357471',
    region: 'cn-northwest-1',
};

new WebbInfraStack(app, 'Webb-Backend-InfraStack', {
    env: devEnv,
});

new WebbFrontendInfraStack(app, 'Webb-Frontend-InfraStack', {
    env: devEnv,
});

app.synth();
