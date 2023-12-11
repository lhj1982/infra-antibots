#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { WebbFrontendInfraStack } from '../lib/webb-frontend-infra-stack';
import { WebbBackendInfraStack } from '../lib/webb-backend-infra-stack';


const app = new cdk.App();

const antiBotsEnv = {
    'antibots-test-cn-northwest-1': {
        account: '439314357471',
        region: 'cn-northwest-1',
    },
    'antibots-prod-cn-morthwest-1': {
        account: '439413396736',
        region: 'cn-northwest-1',
    }
} as const;

const antiBotsAttrTest = {
    'vpcId' : 'vpc-0f9779e69a780c25e',
    'roleName': 'webb-anti-bots-backend-role',
    'albName': 'webbBackendALB',
    'subnetIds' : ['subnet-075e204cb71470d70', 'subnet-0e64f859c59876536', 'subnet-0f02dd76225273efa'],
    'securityGroupIds' : ['sg-0676976675a94e49e'],
    'hostedZoneId' : {
        'id' : 'Z0991920S3CK6DIBDXCL',
        'domainName' : 'antibots.cn.test.origins.nikecloud.com.cn',
        'subDomain' : {
            'subDomainName' : 'api.webb.portal.backend',
            'certificateArn' : 'arn:aws-cn:acm:cn-northwest-1:439314357471:certificate/abafe854-4af7-4037-b07c-58989e2f13f1',
        }
    }
}


const devEnv = {
    account: '439314357471',
    region: 'cn-northwest-1',
};

new WebbBackendInfraStack(app, 'Webb-Backend-InfraStack', {
    env: antiBotsEnv['antibots-test-cn-northwest-1'],
    vpcId: antiBotsAttrTest.vpcId,
    roleName: antiBotsAttrTest.roleName,
    albName: antiBotsAttrTest.albName,
    subnetIds: antiBotsAttrTest.subnetIds,
    securityGroupIds: antiBotsAttrTest.securityGroupIds,
    hostedZoneId: antiBotsAttrTest.hostedZoneId.id,
    domainName: antiBotsAttrTest.hostedZoneId.domainName,
    subDomainName: antiBotsAttrTest.hostedZoneId.subDomain.subDomainName,
    certificateArn: antiBotsAttrTest.hostedZoneId.subDomain.certificateArn
});

// new WebbFrontendInfraStack(app, 'Webb-Frontend-InfraStack', {
//     env: devEnv,
// });

app.synth();
