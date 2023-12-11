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

interface WebbBackendInfraStackProps extends cdk.StackProps {
  env: object;
  vpcId: string;
  roleName: string;
  albName: string;
  subnetIds: string[];
  securityGroupIds: string[];
  hostedZoneId: string;
  domainName: string;
  subDomainName: string;
  certificateArn: string;
}

export class WebbBackendInfraStack extends cdk.Stack {
  public readonly alb: elbv2.CfnLoadBalancer;
  constructor(scope: Construct, id: string, props?: WebbBackendInfraStackProps) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromLookup(this, 'MyVpc', {
      vpcId: props?.vpcId,
    });

    const serverRole = new Role(this, 'webb-anti-bots-backend-role', {
      roleName: props?.roleName,
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
        'AntiBotsInstanceProfile',
        {
          instanceProfileName: 'antiBots-portal-backend',
          role: serverRole,
          path: '/antibots-backend/',
        },
    );

    this.alb = new elbv2.CfnLoadBalancer(this, 'ALB', {
      name: props?.albName,
      subnets: props?.subnetIds,
      type: 'application',
      securityGroups: props?.securityGroupIds,
      tags: [
        {
          key: 'Name',
          value: 'webbBackend' + 'ALB',
        },
      ],
    });
    //route53
    const recordSet = new aws_route53.CfnRecordSet(this, 'RecordSet', {
      name: props?.subDomainName + '.' + props?.domainName,
      type: 'A',
      aliasTarget: {
        dnsName: this.alb.attrDnsName,
        hostedZoneId: this.alb.attrCanonicalHostedZoneId,
      },
      hostedZoneId: props?.hostedZoneId,
    });


    const backendTargetGroup = new elbv2.CfnTargetGroup(this, 'BackendTargetGroup', {
      vpcId: props?.vpcId,
      protocol: elbv2.ApplicationProtocol.HTTP,
      port: 3000,
      healthCheckIntervalSeconds: 15,
      healthCheckPath: '/health',
      healthCheckProtocol: 'HTTP',
      healthCheckTimeoutSeconds: 6,
      healthyThresholdCount: 5,
    });

    const albListener = new elbv2.CfnListener(this, 'ALBListener', {
      loadBalancerArn: cdk.Fn.ref(this.alb.logicalId),
      defaultActions: [{ targetGroupArn: cdk.Fn.ref(backendTargetGroup.logicalId), type: 'forward' }],
      protocol: elbv2.ApplicationProtocol.HTTPS,
      port: 443,
      certificates: [{ certificateArn: props?.certificateArn }],
    });

    new elbv2.CfnListenerRule(this, 'ALBListenerRuleForBackend', {
      listenerArn: albListener.attrListenerArn,
      actions: [{ targetGroupArn: cdk.Fn.ref(backendTargetGroup.logicalId), type: 'forward' }],
      conditions: [{ pathPatternConfig: { values: ['/api/*'] }, field: 'path-pattern' }],
      priority: 1,
    });


  }
}
