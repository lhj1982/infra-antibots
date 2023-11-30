import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import {
  InstanceProfile,
  ManagedPolicy,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal
} from "aws-cdk-lib/aws-iam";
import { aws_route53 } from "aws-cdk-lib";

export class WebbFrontendInfraStack extends cdk.Stack {
  public readonly alb: elbv2.CfnLoadBalancer;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromLookup(this, 'MyVpc', {
      vpcId: 'vpc-0f9779e69a780c25e',
    });

    const serverRole = new Role(this, 'webb-anti-bots-frontend-role', {
      roleName: 'webb-anti-bots-frontend-role',
      assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
      inlinePolicies: {
        ['RetentionPolicy']: new PolicyDocument({
          statements: [
            new PolicyStatement({
              resources: ['*'],
              actions: ['logs:PutRetentionPolicy'],
            }),
          ],
        }),
      },
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
        ManagedPolicy.fromAwsManagedPolicyName('CloudWatchAgentServerPolicy'),
      ],
    });

    new InstanceProfile(
        this,
        'AntiBotsFrontendInstanceProfile',
        {
          instanceProfileName: 'antiBots-portal-frontend',
          role: serverRole,
          path: '/antibots-frontend/',
        },
    );

    this.alb = new elbv2.CfnLoadBalancer(this, 'ALB', {
      name:'webbFrontendALB',
      subnets: ['subnet-075e204cb71470d70', 'subnet-0e64f859c59876536', 'subnet-0f02dd76225273efa'],
      type: 'application',
      securityGroups: ['sg-0676976675a94e49e'],
      tags: [
        {
          key: 'Name',
          value: 'webbFrontend' + 'ALB',
        },
      ],
    });
    //route53
    const recordSet = new aws_route53.CfnRecordSet(this, 'RecordSet', {
      name: 'webb.portal.frontend.antibots.cn.test.origins.nikecloud.com.cn',
      type: 'CNAME',
      aliasTarget: {
        dnsName: this.alb.attrDnsName,
        hostedZoneId: this.alb.attrCanonicalHostedZoneId,
      },
      hostedZoneId: 'Z0991920S3CK6DIBDXCL',
    });

    const certificateArn = 'arn:aws-cn:acm:cn-northwest-1:439314357471:certificate/deb8b85c-fcae-4f96-80ac-3c100e551962';

    const frontendTargetGroup = new elbv2.CfnTargetGroup(this, 'FrontendTargetGroup', {
      vpcId: 'vpc-0f9779e69a780c25e',
      protocol: elbv2.ApplicationProtocol.HTTP,
      port: 3000,
      healthCheckIntervalSeconds: 15,
      healthCheckPath: '/healthcheck',
      healthCheckProtocol: 'HTTP',
      healthCheckTimeoutSeconds: 6,
      healthyThresholdCount: 5,
    });

    const albListener = new elbv2.CfnListener(this, 'ALBListener', {
      loadBalancerArn: cdk.Fn.ref(this.alb.logicalId),
      defaultActions: [{ targetGroupArn: cdk.Fn.ref(frontendTargetGroup.logicalId), type: 'forward' }],
      protocol: elbv2.ApplicationProtocol.HTTPS,
      port: 443,
      certificates: [{ certificateArn: certificateArn }],
    });

    new elbv2.CfnListenerRule(this, 'ALBListenerRuleForFrontend', {
      listenerArn: albListener.attrListenerArn,
      actions: [{ targetGroupArn: cdk.Fn.ref(frontendTargetGroup.logicalId), type: 'forward' }],
      conditions: [{ pathPatternConfig: { values: ['/*'] }, field: 'path-pattern' }],
      priority: 1,
    });
  }
}
