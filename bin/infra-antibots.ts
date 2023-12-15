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

const antiBotsBackendAttrTest = {
    'vpcId' : 'vpc-0f9779e69a780c25e',
    'roleName': 'webb-anti-bots-backend-role',
    'albName': 'webbBackendALB',
    'subnetIds' : ['subnet-075e204cb71470d70', 'subnet-0e64f859c59876536', 'subnet-0f02dd76225273efa'],
    'hostedZoneId' : {
        'id' : 'Z0991920S3CK6DIBDXCL',
        'domainName' : 'antibots.cn.test.origins.nikecloud.com.cn',
        'subDomain' : {
            'subDomainName' : 'api.webb.portal',
            'certificateArn' : 'arn:aws-cn:acm:cn-northwest-1:439314357471:certificate/abafe854-4af7-4037-b07c-58989e2f13f1',
        }
    }
}

const antiBotsFrontendAttrTest = {
    'vpcId' : 'vpc-0f9779e69a780c25e',
    'roleName': 'webb-anti-bots-fronted-role',
    'albName': 'webbFrontendALB',
    'subnetIds' : ['subnet-0da1766492b750893', 'subnet-06da179024e04fbbd', 'subnet-05abf20a7b7d9cfac'],
    'hostedZoneId' : {
        'id' : 'Z0991920S3CK6DIBDXCL',
        'domainName' : 'antibots.cn.test.origins.nikecloud.com.cn',
        'subDomain' : {
            'subDomainName' : 'webb.portal',
            'certificateArn' : 'arn:aws-cn:acm:cn-northwest-1:439314357471:certificate/deb8b85c-fcae-4f96-80ac-3c100e551962',
        }
    }
}



// new WebbBackendInfraStack(app, 'Webb-Backend-InfraStack', {
//     env: antiBotsEnv['antibots-test-cn-northwest-1'],
//     vpcId: antiBotsBackendAttrTest.vpcId,
//     roleName: antiBotsBackendAttrTest.roleName,
//     albName: antiBotsBackendAttrTest.albName,
//     subnetIds: antiBotsBackendAttrTest.subnetIds,
//     hostedZoneId: antiBotsBackendAttrTest.hostedZoneId.id,
//     domainName: antiBotsBackendAttrTest.hostedZoneId.domainName,
//     subDomainName: antiBotsBackendAttrTest.hostedZoneId.subDomain.subDomainName,
//     certificateArn: antiBotsBackendAttrTest.hostedZoneId.subDomain.certificateArn
// });

new WebbFrontendInfraStack(app, 'Webb-Frontend-InfraStack', {
    env: antiBotsEnv['antibots-test-cn-northwest-1'],
    vpcId: antiBotsFrontendAttrTest.vpcId,
    roleName: antiBotsFrontendAttrTest.roleName,
    albName: antiBotsFrontendAttrTest.albName,
    subnetIds: antiBotsFrontendAttrTest.subnetIds,
    hostedZoneId: antiBotsFrontendAttrTest.hostedZoneId.id,
    domainName: antiBotsFrontendAttrTest.hostedZoneId.domainName,
    subDomainName: antiBotsFrontendAttrTest.hostedZoneId.subDomain.subDomainName,
    certificateArn: antiBotsFrontendAttrTest.hostedZoneId.subDomain.certificateArn
});

app.synth();
