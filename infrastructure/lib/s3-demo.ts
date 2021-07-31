import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as iam from '@aws-cdk/aws-iam';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';

export class S3CdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this, 'cloudfront-OAI', {
      comment: `OAI for MyBucket`
    });

    const myBucket = new s3.Bucket(this, 'MyBucket', {
      versioned: true,
      websiteIndexDocument: 'index.html',
      publicReadAccess: false,
      //blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    });
    
    myBucket.addToResourcePolicy(new iam.PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [myBucket.arnForObjects('*')],
      principals: [new iam.AnyPrincipal()]
    }));
    
    new s3deploy.BucketDeployment(this, 'DeployWithInvalidation', {
      sources: [s3deploy.Source.asset('./dist')],
      destinationBucket: myBucket
    });
  }
}
